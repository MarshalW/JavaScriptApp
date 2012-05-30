/**
 * Created with JetBrains WebStorm.
 * User: marshal
 * Date: 12-5-28
 * Time: 下午12:05
 * To change this template use File | Settings | File Templates.
 */

var marshal = {
};

(function (marshal) {
    var View = Backbone.View.extend({
        register:function (state) {
            this.state = state;
            return this;
        }
    });

    var User = Backbone.Model.extend({
    });

    var UserCollection = Backbone.Collection.extend({
        model:User
    });

    var UserView = View.extend({
        tagName:'li',
        render:function () {
            var view = this;

            this.$el.append('<span class="userName"></span>');
            this.$el.append('<button class="removeUser">删除</button>');
            this.$el.find('.userName').text(this.model.get('name'));

            return this;
        },
        events:{
            'click .removeUser':'delete',
            'click .userName':'modify'
        },
        delete:function () {
            this.state.trigger('removeUser', this.model);
            this.remove();
        },
        modify:function () {
            this.state.trigger('modifyUser', this.model);
        }
    });

    var UserListView = View.extend({
        initialize:function () {
            this.state = new Backbone.Model();
            this.router = this.options.router;
        },
        render:function () {
            var view = this;
            $('<button class="addButton">加用户</button>').appendTo(this.$el);
            $('<ul></ul>').appendTo(this.$el);

            this.collection.forEach(function (user) {
                view.createUserView(user);
            });

            this.state.on('removeUser', function (user) {
                view.collection.remove(user);
            });

            this.state.on('modifyUser', function (user) {
                view.router.navigate('edit/' + user.cid, {trigger:true});
            });

            return this;
        },
        createUserView:function (user) {
            var userView = new UserView({
                model:user
            });
            userView.register(this.state).render().$el.appendTo(this.$el.find('ul'));
        },
        events:{
            'click .addButton':'createUser'
        },
        createUser:function () {
            this.router.navigate('edit', {trigger:true});
        }
    });

    var UserModifyView = View.extend({
        initialize:function () {
            this.router = this.options.router;
        },
        render:function () {
            this.$el.append('<input class="inputName"/>');
            this.$el.append('<button>加入</button>');

            if (this.model) {
                this.$el.find('.inputName').val(this.model.get('name'));
            }
            return this;
        },
        events:{
            'click button':'modify'
        },
        modify:function () {
            var view = this;
            if (this.model) {
                this.model.set('name', this.$el.find('.inputName').val());
            } else {
                this.router.userCollection.add(new User({
                    name:view.$el.find('.inputName').val()
                }));
            }
            this.router.navigate('list', {trigger:true});
        }
    });

    marshal.UserEditor = Backbone.Router.extend({
        initialize:function (el) {
            this.el = el;
            this.userCollection = new UserCollection([new User({name:'张三'})]);
        },
        routes:{
            '':'list',
            'list':'list',
            'edit':'edit',
            'edit/:cid':'edit'
        },
        list:function () {
            console.log('list:'+this.el);
            var router = this;
            this.clean();
            this.currentView = new UserListView({
                    collection:router.userCollection,
                    router:router
                }
            ).render().$el.appendTo($(this.el));
        },
        edit:function (cid) {
            var router = this,
                user = null;
            this.clean();

            if (cid) {
                user = router.userCollection.getByCid(cid);
            }
            this.currentView = new UserModifyView({
                model:user,
                router:router
            }).render().$el.appendTo($(this.el));
        },
        clean:function () {
            if (this.currentView) {
                this.currentView.remove();
                this.currentView = null;
            }
        }
    });
}(marshal));