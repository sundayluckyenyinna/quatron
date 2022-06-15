"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PersonalDetails {
    constructor(gender, dateOfBirth, stateOfOrigin) {
        this.gender = gender;
        this.dateOfBirth = dateOfBirth;
        this.stateOfOrigin = stateOfOrigin;
    }
    ;
    static NewInstance(object) {
        return new PersonalDetails(object.gender, object.dateOfBirth, object.stateOfOrigin);
    }
    ;
    getGender() {
        return this.gender;
    }
    ;
    getDateOfBirth() {
        return this.dateOfBirth;
    }
    ;
    getStateOfOrigin() {
        return this.stateOfOrigin;
    }
    ;
}
exports.default = PersonalDetails;
