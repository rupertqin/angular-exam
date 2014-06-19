'use strict';

var config = window._config = {};

config.api = {
    onlineConfig: {
        path: 'http://jxb.com',
        port: '',
        project: '/',
        version: ''
    },
    contextPath: function() {
        var offlineContextPath = '/' + window.location.pathname.split('/')[1],
            onlineContextPath =
                this.onlineConfig.path +
                this.onlineConfig.port +
                this.onlineConfig.project +
                this.onlineConfig.version;

       return this.online ? onlineContextPath : offlineContextPath;
    },
    getServiceURL : function(serviceKey, paramKey) {
        var apiURLs = config.api.apiURL[config.api.online ? "online" : "offline"],
            contextPath = config.api.contextPath(),
            serviceURL = apiURLs[serviceKey];

        if (serviceURL) {
            var reg = /\{([^\}]+)\}/g,
                result;

            serviceURL = serviceURL.replace(reg, function(str, key) {
                result = str;
                if (key in paramKey) {
                    result = paramKey[key];
                }
                return result;
            });
        }

        return serviceURL ? contextPath + serviceURL : '';
    },
    online : false,
    apiURL : {
        online : {
            // TODO
        },
        offline : {
            // TODO
        }
    }
};

config.consts = {
    storageKey: {

    },
    messageKey: {

    },
    observerKey: {
        EVENT_LOADING_START: 'event.loading.start',
        EVENT_LOADING_STOP: 'event.loading.end',
        EVENT_LOCALE_UPDATE: 'event.locale.update'
    }
};

config.locale = {
    defaults : {
        locale : 'zh-CN',
        path : 'i18n',
        prefix: 'locale'
    },
    locales : ['zh-CN', 'en-US']
};

config.views = {
    notify: 'views/common/notify.html',
    header: 'views/common/header.html',
    footer: 'views/common/footer.html',
    navigation: 'views/common/navigation.html',
    homepage: 'views/homepage.html',
    quiz_builder: 'views/quiz_builder.html',
    draftEdit: 'views/draft_edit.html',
    examPapers: 'views/exam_papers.html',
    topicbank: 'views/topicbank.html'
};

config.routers = {
    'quizBuilder': {
        url: '/tools/quiz_builder?offline&course_id&quiz_draft_id',
        view: config.views.quiz_builder,
        ctrl: 'QuizBuilderCtrl',
        title: '出卷神器'
    },
    'draft': {
        url: '/tools/draft/edit?course_id&attachment_id&offline',
        view: config.views.draftEdit,
        ctrl: 'DraftEditCtrl',
        title: '试卷编辑'
    },
    'examPapers': {
        url: '/tools/exam_papers?offline',
        view: config.views.examPapers,
        ctrl: 'ExamPapersCtrl',
        title: '试卷中心'
    },
    'examPapers.options': {
        url: '/category/:category',
        view: 'views/exam_papers_options.html',
        ctrl: 'ExamPapersOptionsCtrl',
        title: '试卷中心'
    },
    'examPapers.options.detail': {
        url: '/?option_value_ids',
        view: 'views/exam_papers_detail.html',
        ctrl: 'ExamPapersDetailCtrl',
        title: '列表页－试卷中心'
    },
    'homepage': {
        url: '/homepage',
        view: config.views.homepage,
        ctrl: 'HomepageCtrl'
    },
    'topicbank': {
        url: '/topicbank',
        view: config.views.topicbank,
        ctrl: 'TopicBankCtrl'
    }
};

config.notify = {
    types: {
        'success': {
            clazz: 'alert-success',
            title: 'Well done',
            message: ''
        },
        'info': {
            clazz: 'alert-info',
            title: 'Heads up',
            message: ''
        },
        'warning': {
            clazz: 'alert-warning',
            title: 'Warning',
            message: ''
        },
        'danger': {
            clazz: 'alert-danger',
            title: 'Oh snap',
            message: ''
        }
    },
    timeout: 3000
};
