define([
    'initConfig',
    'zelda/uni_return_server/script/uni_return_server.service.js',
    'zelda/n1/js/n1Service.js',
    'zelda/js/zeldaService.js',
    'css!zelda/uni_return_server/index.css'
], function (app) {
    'use strict';

    app.register.directive('ursListManager', ['$timeout', 'uniReturnServerApi', '$modal', '$q', 'n1Service', 'tipservice',
        function ($timeout, uniReturnServerApi, $modal, $q, n1Service, tipservice) {
            return {
                restrict: 'A',
                scope: true,
                controller: ['$scope', function ($scope) {

                    $scope.page = {};

                    var self = this;

                    //打开关闭状态
                    var status = {};

                    var ursList = [];

                    //主题
                    var subscribe = {};

                    //创建Modal
                    var modal = function (options) {
                        var templateUrl = options.templateUrl || 'zelda/uni_return_server/tpl/urs.modal.html';
                        var modal = $modal.open({
                            templateUrl: templateUrl,
                            controller: ['$scope', 'zeldaCommon', function ($scope, zeldaCommon) {

                                $scope.title = options.title || '';

                                $scope.pns = options.pns || [];

                                $scope.isEdit = options.isEdit;

                                $scope.groups = [];

                                $scope.images = [];

                                $scope.ursInfo = {};

                                $scope.ursInfo.group_id = $scope.groups.length ? $scope.groups[0].id : '';

                                $scope.ursInfo.pn = $scope.pns.length ? $scope.pns[0] : '';

                                $scope.pnChange = function () {
                                    if ($scope.ursInfo.pn) {
                                        $scope.groups = options.groups.filter(function (item) {
                                            return item.pn_id === $scope.ursInfo.pn.id;
                                        });
                                        $scope.ursInfo.group_id = $scope.groups.length ? $scope.groups[0].id : '';

                                        $scope.images = options.images.filter(function (item) {
                                            return item.networks.indexOf($scope.ursInfo.pn.network_id) !== -1;
                                        });
                                        $scope.ursInfo.image_id = $scope.images.length ? $scope.images[0].id : '';
                                    } else {
                                        $scope.groups = [];
                                        $scope.images = [];
                                        delete $scope.ursInfo.image_id;
                                        delete $scope.ursInfo.group_id;
                                    }
                                };

                                $scope.$watch('ursInfo.group_id', function (newVal) {
                                    $scope.deploy_pattern_is_ciab = isCiaB(newVal);
                                    $scope.ursInfo.n1_number = $scope.deploy_pattern_is_ciab ? '' : 2;
                                });

                                $scope.pnChange();

                                if (options.init) {
                                    $scope.ursInfo.name = options.init.name;
                                    $scope.ursInfo.location = options.init.location;
                                    $scope.ursInfo.pn = options.pns.filter(function (item) {
                                        return item.id === options.init.pn_id;
                                    })[0];
                                    $scope.ursInfo.memo = options.init.memo;
                                    $scope.ursInfo.group_id = options.init.group_id;
                                }

                                //取消
                                $scope.cancel = function () {
                                    modal.dismiss();
                                };

                                //确定
                                $scope.ok = function () {
                                    if (options.callBack) {
                                        options.callBack($scope.ursInfo, modal);
                                    }
                                };

                                function isCiaB(id) {
                                    var group = options.groups.filter(function (item) {
                                        return item.id === id;
                                    });
                                    if (group.length) {
                                        group = group[0];
                                        return zeldaCommon.groupIsCiaB(group, 'deploy_pattern');
                                    } else {
                                        return false;
                                    }
                                }

                            }],
                            windowClass: 'higos-modal-lg',
                            size: 'lg'
                        });
                    };

                    function prepareModalData() {
                        var qArray = [
                            n1Service.protection.getData(),
                            n1Service.protection.getGroupData(),
                            n1Service.n1.getImageData()
                        ];
                        return $q.all(qArray).then(function (data) {
                            try {
                                return {
                                    pns: data[0].result.objects,
                                    groups: data[1].result.objects.filter(function (item) {
                                        return item.deploy_pattern === 'P2-1-2';
                                    }),
                                    images: data[2].result.objects
                                };
                            } catch (e) {
                                return null;
                            }
                        })
                    }

                    //创建新的回源点
                    $scope.create = function () {

                        prepareModalData().then(function (data) {
                            if (data) {
                                modal({
                                        title: '新建回源点',
                                        pns: data.pns,
                                        groups: data.groups,
                                        images: data.images,
                                        callBack: function (data, modal) {
                                            var param = angular.fromJson(angular.toJson(data));
                                            param.pn_id = param.pn.id;
                                            delete param.pn;
                                            uniReturnServerApi.urs.create(param)
                                                .then(function (res) {
                                                    if (res) {
                                                        modal.dismiss();
                                                        return n1Service.n1.createAuto(param);
                                                    }
                                                    return null;
                                                })
                                                .then(function (res) {
                                                    if (res) {
                                                        var status = res.status;
                                                        if (status !== 2000) {
                                                            if (status === 5002) {
                                                                tipservice.createTip('error', 'EIP数量不足，创建失败');
                                                            } else {
                                                                tipservice.createTip('error', 'N1创建失败');
                                                            }
                                                        }
                                                    }
                                                    self.updateUrsList().then(function () {

                                                    });
                                                });
                                        }
                                    }
                                );
                            }
                        });
                    };

                    //新增方向代理虚机
                    $scope.addVM = function () {
                        $q.all([n1Service.n1.getImageData(), uniReturnServerApi.urs.list(), n1Service.protection.getGroupData()])
                            .then(function (data) {
                                return {
                                    images: data[0].result.objects,
                                    uniReturnServerList: data[1].returnServer,
                                    groups: data[2].result.objects.filter(function (item) {
                                        return item.deploy_pattern === 'P2-1-2';
                                    })
                                };
                            })
                            .then(function (data) {
                                if (data) {
                                    var modal = $modal.open({
                                        templateUrl: 'zelda/uni_return_server/tpl/urs.vm.modal.html',
                                        controller: ['$scope', 'zeldaCommon',function ($scope, zeldaCommon) {

                                            $scope.title = '新建反向代理虚机';

                                            $scope.uniReturnServerList = data.uniReturnServerList || [];

                                            $scope.images = data.images || [];

                                            $scope.ursInfo = {};

                                            $scope.deploy_pattern_is_ciab = false;

                                            $scope.$watch('ursInfo.return_server_id', function (newVal) {
                                                if(newVal){
                                                    $scope.deploy_pattern_is_ciab = isCiaB(newVal.id);
                                                }else{
                                                    $scope.deploy_pattern_is_ciab = false;
                                                }
                                                $scope.ursInfo.n1_number = $scope.deploy_pattern_is_ciab ? '' : 2;
                                            });

                                                //取消
                                            $scope.cancel = function () {
                                                modal.dismiss();
                                            };

                                            //确定
                                            $scope.ok = function () {
                                                var params = {};
                                                params.image_id = $scope.ursInfo.image_id;
                                                params.n1_number = $scope.ursInfo.n1_number;
                                                params.group_id = $scope.ursInfo.return_server.group_id;
                                                params.pn_id = $scope.ursInfo.return_server.pn_id;
                                                n1Service.n1.createAuto(params)
                                                    .then(function (res) {
                                                        if (res) {
                                                            var status = res.status;
                                                            if (status !== 2000) {
                                                                if (status === 5002) {
                                                                    tipservice.createTip('error', 'EIP数量不足，创建失败');
                                                                } else {
                                                                    tipservice.createTip('error', 'N1创建失败');
                                                                }
                                                            }else{
                                                                modal.dismiss();
                                                                self.updateUrsList();
                                                            }
                                                        }
                                                    });
                                            };

                                            function isCiaB(id) {
                                                var group = data.groups.filter(function (item) {
                                                    return item.id === id;
                                                });
                                                if (group.length) {
                                                    group = group[0];
                                                    return zeldaCommon.groupIsCiaB(group, 'deploy_pattern');
                                                } else {
                                                    return false;
                                                }
                                            }
                                        }],
                                        windowClass: 'higos-modal-lg',
                                        size: 'lg'
                                    });
                                }
                            });
                    };


                    // 修改回源点
                    this.edit = function (item) {
                        prepareModalData().then(function (data) {
                            modal({
                                title: '修改回源点',
                                pns: data.pns,
                                groups: data.groups,
                                images: data.images,
                                init: item,
                                isEdit: true,
                                callBack: function (data, modal) {
                                    var param = {
                                        rs_id: item.id,
                                        name: data.name,
                                        location: data.location,
                                        memo: data.memo
                                    };
                                    uniReturnServerApi.urs.update(param)
                                        .then(function (res) {
                                            if (res) {
                                                modal.dismiss();
                                                self.updateUrsList();
                                            }
                                        });
                                }
                            });
                        });
                    };

                    //加载数据列表
                    this.updateUrsList = function () {
                        return uniReturnServerApi.urs.list()
                            .then(function (data) {
                                var list = data && data.returnServer ? data.returnServer : [];
                                list.forEach(function (item) {
                                    item.nginxServer = item.n1_list.length;
                                    item.bussiness_in = item.labels['BUSINESS-IN'];
                                    item.bussiness_out = item.labels['BUSINESS-OUT'];
                                });
                                $scope.page.list = list;
                                ursList = list;
                                return $scope.page.list;
                            });
                    };

                    //更新打开关闭状态
                    this.updateUrsStatus = function (id, _status) {
                        _status = _status === undefined ? !status[id] : _status;
                        status[id] = !!_status;
                        if (status[id]) {
                            this.publish(id);
                        }
                    };

                    this.getList = function () {
                        return ursList;
                    };

                    //获取是否处于打开状态
                    this.usrIsOpen = function (id) {
                        return status[id];
                    };

                    //订阅主题
                    this.subscribe = function (topic, id, callback) {
                        subscribe[topic] = callback;
                        if (status[id]) {
                            callback();
                        }
                    };

                    //发布主题
                    this.publish = function (id) {
                        if (subscribe[id + '/open']) {
                            subscribe[id + '/open']();
                        }
                    };

                    //所有打开的
                    this.publishAllOpen = function () {
                        for (var key in status) {
                            if (status[key]) {
                                self.publish(key);
                            }
                        }
                    };

                    //销毁
                    this.remove = function (id) {
                        delete status[id];
                        delete subscribe[id + '/open'];
                    };
                }],
                link: function ($scope, $element, $attr, ctrl) {

                    //初始化
                    ctrl.updateUrsList();
                }
            };
        }]);

    app.register.directive('ursItemToggle', [function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                toggleId: '='
            },
            require: '^ursListManager',
            transclude: true,
            template: '<div class="urs-toggle"></div>',
            compile: function (element, attr) {
                return function ($scope, $element, $attr, ctrl) {


                    //展开按钮被点击
                    $element.bind('click', function () {
                        ctrl.updateUrsStatus($scope.toggleId);
                    });
                };
            }
        };
    }]);

    app.register.directive('ursItem', ['$rootScope', '$modal', 'bolavenApi', 'alertservice', 'uniReturnServerApi',
        function ($rootScope, $modal, bolavenApi, alertservice, uniReturnServerApi) {
            return {
                restrict: 'EA',
                scope: {
                    itemData: '='
                },
                require: '^ursListManager',
                replace: true,
                transclude: true,
                templateUrl: 'zelda/uni_return_server/tpl/urs.item.html',
                compile: function (element, attr) {


                    return function ($scope, $element, $attr, ctrl) {

                        //当前列表是否打开状态
                        $scope.isActive = function () {
                            return ctrl.usrIsOpen($scope.itemData.id) ? 'active' : '';
                        };

                        //修改
                        $scope.edit = function () {
                            ctrl.edit($scope.itemData);
                        };

                        //删除
                        $scope.delete = function () {
                            alertservice.createalert($scope, 0, '删除', '删除后，无法恢复，确定删除吗', {
                                subbtn: {
                                    callback: 'deleteCallBack'
                                },
                                resetbtn: {}
                            });
                        };

                        $scope.deleteCallBack = function () {
                            uniReturnServerApi.urs.delete($scope.itemData.id)
                                .then(function (res) {
                                    if (res) {
                                        ctrl.remove($scope.itemData.id);
                                        ctrl.updateUrsList();
                                    }
                                });
                        };
                    };
                }
            };
        }]);

    app.register.directive('ursImage', ['$timeout', '$modal', 'w5cValidator', 'alertservice', 'tipservice', 'n1Service',
        function ($timeout, $modal, w5cValidator, alertservice, tipservice, n1Service) {
            return {
                restrict: 'EA',
                scope: {
                    ursId: '='
                },
                require: '^ursListManager',
                replace: true,
                templateUrl: 'zelda/uni_return_server/tpl/urs.image.html',
                compile: function (element, attr) {
                    return function ($scope, $element, $attr, ctrl) {

                        var status_dict = {
                            '0': '创建中',
                            '1': '完成系统配置',
                            '2': '防护初始化中',
                            '3': '完成防护配置',
                            '4': '待使用',
                            '5': '停用',
                            '6': '删除',
                            '7': '使用中'
                        };


                        ctrl.subscribe($scope.ursId + '/open', $scope.ursId, function () {
                            var list = ctrl.getList().filter(function (item) {
                                return item.id === $scope.ursId;
                            }).map(function (item) {
                                return item.n1_list;
                            })[0];
                            list = list || [];
                            var temp;
                            list.forEach(function (item) {
                                item.operations = [];
                                if (item.status === 1 || item.status === 5) {
                                    item.operations.push('init');
                                }
                                if (item.status === 1 || item.status === 3 || item.status === 4) {
                                    item.operations.push('stop');
                                }
                                if (item.status === 5) {
                                    item.operations.push('delete');
                                }
                                item.status_text = status_dict[item.status] || '';
                                item.ip = {};
                                temp = [].concat(Object.values(item.interfaces['REAL-IN'] || {}));
                                item.ip.private = temp.length ? temp[0] : '';
                                temp = [].concat(Object.values(item.interfaces['REAL-OUT'] || {}));
                                item.ip.public = temp.length ? temp[0] : '';
                            });
                            $scope.images = list;
                        });

                        $scope.hasOperation = function (op, item) {
                            return item.operations.indexOf(op) !== -1;
                        };

                        // 初始化
                        $scope.init = function (item) {
                            alertservice.createalert($scope, 0, '初始化', '是否进行初始化操作', {
                                subbtn: {
                                    callback: 'initCallBack',
                                    param: item
                                },
                                resetbtn: {}
                            });
                        };

                        $scope.initCallBack = function (item) {
                            n1Service.n1.initWaf(item.id).then(function (response) {
                                var status = response.status - 0;
                                if (status === 2000) {
                                    tipservice.createTip('info', '初始化中');
                                    ctrl.updateUrsList();
                                } else {
                                    tipservice.createTip('error', '初始化失败');
                                }
                            }, function () {
                                tipservice.createTip('error', '初始化失败');
                            });
                        };

                        // 停用
                        $scope.stop = function (item) {
                            alertservice.createalert($scope, 0, '停用', '是否进行停用操作', {
                                subbtn: {
                                    callback: 'stopCallBack',
                                    param: item
                                },
                                resetbtn: {}
                            });
                        };

                        $scope.stopCallBack = function (item) {
                            n1Service.n1.stopWaf(item.id).then(function (response) {
                                var status = response.status - 0;
                                if (status === 2000) {
                                    tipservice.createTip('info', '停用中');
                                    ctrl.updateUrsList();
                                } else {
                                    tipservice.createTip('error', '停用失败');
                                }
                            }, function () {
                                tipservice.createTip('error', '停用失败');
                            });
                        };

                        // 删除
                        $scope.delete = function (item) {
                            alertservice.createalert($scope, 0, '删除', '删除后，无法恢复，确定删除吗', {
                                subbtn: {
                                    callback: 'deleteCallBack',
                                    param: item
                                },
                                resetbtn: {}
                            });
                        };

                        $scope.deleteCallBack = function (item) {
                            n1Service.n1.deleteWaf(item.id).then(function (response) {
                                var status = response.status - 0;
                                if (status === 2000) {
                                    tipservice.createTip('info', '删除中');
                                    ctrl.updateUrsList();
                                } else {
                                    tipservice.createTip('error', '删除失败');
                                }
                            }, function () {
                                tipservice.createTip('error', '删除失败');
                            });
                        };

                    };
                }
            };
        }]);

    app.register.controller('uniReturnServerController', ['$scope', 'uniReturnServerApi',
        function ($scope, uniReturnServerApi) {

        }]);

});
