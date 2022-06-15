"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Name {
    constructor(surname, firstName, middleName) {
        this.surname = surname;
        this.firstName = firstName;
        this.middleName = middleName;
    }
    ;
    static NewInstance(object) {
        return new Name(object.surname, object.firstName, object.middleName);
    }
    ;
    getSurname() {
        return this.surname;
    }
    ;
    getFirstName() {
        return this.firstName;
    }
    ;
    getMiddleName() {
        return this.middleName;
    }
    ;
    getFullNameSeparatedBy(delimiter = ' ') {
        const nameArray = [this.surname, this.firstName, this.middleName];
        var fullName = '';
        nameArray.forEach(name => { fullName += (delimiter + name); });
        return fullName.substring(fullName.indexOf(delimiter) + 1);
    }
    ;
    getFullName() {
        return this.getFullNameSeparatedBy('#');
    }
    ;
}
exports.default = Name;
;
