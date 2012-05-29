/**
 * Created with JetBrains WebStorm.
 * User: marshal
 * Date: 12-5-28
 * Time: 下午12:05
 * To change this template use File | Settings | File Templates.
 */

var View = Backbone.View.extend({
    register:function (state) {
        this.state = state;
        return this;
    }
});

var User = Backbone.Model.extend({
});

var UserView = View.extend({
    tagName:'li',
    render:function () {
        var view = this;

        this.userNameEl = $('<span></span>')
        this.$el.append(this.userNameEl);
        this.$el.append($('<button>删除</button>'));
        this.setUserName();

        this.model.on('change:name', function (user) {
            view.setUserName();
        });
        return this;
    },
    setUserName:function () {
        this.userNameEl.text(this.model.get('name'));
    },
    events:{
        'click button':'delete',
        'click':'modify'
    },
    delete:function () {
        this.state.trigger('removeUser', this.model);
        this.remove();
        return false;
    },
    modify:function () {
        this.state.trigger('modifyUser', this.model);
    }
});

var UserInputView = View.extend({
    inputElement:$('<input />'),
    addButton:$('<button>加入</button>'),
    render:function () {
        this.$el.append(this.inputElement);
        this.$el.append(this.addButton);
        return this;
    },
    events:{
        'click button':'addToList'
    },
    addToList:function () {
        if (this.currentUser) {
            this.currentUser.set('name', this.inputElement.val());
            this.currentUser = null;
        } else {
            var view = this;
            var user = new User({
                name:view.inputElement.val()
            });
            this.state.trigger('addUser', user);
        }
        this.inputElement.val('');
    },
    setCurrentUser:function (user) {
        if (user) {
            this.currentUser = user;
            this.inputElement.val(user.get('name'));
        } else {
            this.currentUser = null;
            this.inputElement.val('');
        }

    }
});

var UserCollection = Backbone.Collection.extend({
    model:User
});

var UserListView = View.extend({
    ulElement:$('<ul></ul>'),
    render:function () {
        var view = this;
        this.ulElement.appendTo(this.$el);

        this.collection.on('add', function (user) {
            var userView = new UserView({
                model:user
            });
            userView.register(view.state).render().$el.appendTo(view.$el);
        });
        return this;
    }
});

var UserListComponentView = Backbone.View.extend({
    state:new Backbone.Model(),
    initialize:function (userInputEl, userListEl) {
        this.userInputView = new UserInputView({
            el:userInputEl
        });
        this.userListView = new UserListView({
            collection:new UserCollection(),
            el:userListEl
        })
    },
    render:function () {
        var view = this;
        this.userListView.register(this.state).render();
        this.userInputView.register(this.state).render();

        this.state.on('addUser', function (user) {
            view.userListView.collection.add(user);
        });

        this.state.on('removeUser', function (user) {
            view.userListView.collection.remove(user);
            view.userInputView.setCurrentUser(null);
        });

        this.state.on('modifyUser', function (user) {
            view.userInputView.setCurrentUser(user);
        });
    }
});

$(document).ready(function () {
    var userListComponentView = new UserListComponentView('#personNameInput', '#userList');
    userListComponentView.render();
});