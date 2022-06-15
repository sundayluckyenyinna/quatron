import PersonalDetails from './data/personal-data';
import SchoolDetails from './data/school-details';
import Subject from './subject';
import Name from './data/name';


export default class Student
{
     private name : Name;

     private personalDetails : PersonalDetails;

     private schoolDetails : SchoolDetails;

     private subjects : string[];

     constructor( name : Name, personalDetails : PersonalDetails,
         schoolDetails : SchoolDetails, subjects : string[] ) {
            this.name = name;
            this.personalDetails = personalDetails;
            this.schoolDetails = schoolDetails;
            this.subjects = subjects;
         };
    
    static NewInstance( object : Object ){
        
    };

    getName() : Name {
        return this.name;
    };

    getPersonalDetails() : PersonalDetails {
        return this.personalDetails;
    };

    getSchoolDetails() : SchoolDetails {
        return this.schoolDetails;
    };

    getSubjects() : string[] {
        return this.subjects;
    };

    getSubjectString( delimiter : string = '#' ) : string {
        var subjectString = '';
        this.subjects.forEach( subject => { subjectString += delimiter + subject });
        return subjectString.substring( subjectString.indexOf( delimiter ) + 1 );
    };

};