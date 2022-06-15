
export default class PersonalDetails
{
    private gender : string;

    private dateOfBirth : string;

    private stateOfOrigin : string;

    constructor( gender : string, dateOfBirth : string, stateOfOrigin : string ){
        this.gender = gender;
        this.dateOfBirth = dateOfBirth;
        this.stateOfOrigin = stateOfOrigin;
    };

    static NewInstance( object : Object | any ) : PersonalDetails {
        return new PersonalDetails( object.gender, object.dateOfBirth, object.stateOfOrigin );
    };

    getGender() : string {
        return this.gender;
    };

    getDateOfBirth() : string {
        return this.dateOfBirth;
    };

    getStateOfOrigin() : string {
        return this.stateOfOrigin;
    };

}