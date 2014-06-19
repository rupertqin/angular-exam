# config valid only for Capistrano 3.1
lock '3.1.0'

set :application, 'frontend'
#set :repo_url, 'git@58.215.173.29:jxb-front.git'

# Default branch is :master
# ask :branch, proc { `git rev-parse --abbrev-ref HEAD`.chomp }

# Default deploy_to directory is /var/www/my_app
# set :deploy_to, '/var/www/my_app'
set :deploy_to, '/home/jxb/frontend'

# Default value for :scm is :git
# set :scm, :git

# Default value for :format is :pretty
# set :format, :pretty

# Default value for :log_level is :debug
# set :log_level, :debug

# Default value for :pty is false
# set :pty, true

# Default value for :linked_files is []
# set :linked_files, %w{config/database.yml}

# Default value for linked_dirs is []
# set :linked_dirs, %w{bin log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system}

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
# set :keep_releases, 5

namespace :deploy do

  #=====================================
  # Hack the capistrano deploy procedure
  #=====================================

  # Maybe the right way is to overwrite git:check task to do nothing,
  # But capistrano call `load git.task` internally.
  # So we have to hack the deploy:check task.
  Rake::Task['deploy:check'].clear
  desc 'Check required files and directories exist'
  task :check do
    #invoke "#{scm}:check" # do not call git:check
    invoke 'deploy:check:directories'
    invoke 'deploy:check:linked_dirs'
    invoke 'deploy:check:make_linked_dirs'
    invoke 'deploy:check:linked_files'
  end

  Rake::Task['symlink:shared'].clear
  namespace :symlink do
    task :shared do
      # We have nothing to share
      # Overwrite to skip creating symbol links
    end
  end

  Rake::Task['deploy:updating'].clear
  desc 'update code'
  task :updating => :new_release_path do
    # Overwrite to deploy by uploading files
    invoke 'deploy:upload'
  end

  before :updating, :build

  desc 'upload'
  task :upload do
    on roles(:all) do
      upload! 'dist', release_path, recursive: true
    end
  end

  desc 'build distribution'
  task :build do
    run_locally do
      execute :grunt, 'build'
    end
  end
end
