const moment = require('moment');

module.exports = {
    formatDate: function(date, format) {
        //console.log(typeof date);
        if(typeof date === "object"){
            return moment(date).format(format);
        } else {
            return "Update exit time"
        }
    },
    editIcon: function (logUser, loggedUser, logId, floating = true) {
        //console.log(logUser);
        //console.log(loggedUser);
        //console.log(logId);
        if (logUser._id.toString() == loggedUser._id.toString()) {
          if (floating) {
            return `<a href="/logs/edit/${logId}" class="btn-floating halfway-fab blue"><i class="fas fa-edit fa-small"></i></a>`
          } else {
            return `<a href="/logs/edit/${logId}"><i class="fas fa-edit"></i></a>`
          }
        } else {
          return ''
        }
    }
}