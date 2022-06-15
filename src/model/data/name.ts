import path from 'path';

export default class Name 
{
    private surname : string;

    private firstName : string;

    private middleName : string;

    constructor( surname : string, firstName : string, middleName : string ){
        this.surname = surname;
        this.firstName = firstName;
        this.middleName = middleName;
    };

    static NewInstance( object: Object | any ) : Name {
        return new Name(object.surname, object.firstName, object.middleName);
    };

    getSurname() : string {
        return this.surname;
    };

    getFirstName() : string {
        return this.firstName;       
    };

    getMiddleName() : string {
        return this.middleName;
    };

    private getFullNameSeparatedBy(delimiter : string = ' ' ){
        const nameArray = [ this.surname, this.firstName, this.middleName ];
        var fullName = '';
        nameArray.forEach( name => { fullName += (delimiter + name) } );
        return fullName.substring(fullName.indexOf(delimiter) + 1 );
    };

    getFullName(){
        return this.getFullNameSeparatedBy('#');
    };

};