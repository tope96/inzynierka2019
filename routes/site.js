//Controllers
var controller = require('../controllers/controller.js');
var companyController = require('../controllers/companyController.js');
var humanResourcesController = require('../controllers/humanResourcesController.js');
var productionController = require('../controllers/productionController.js');

//Dependencies
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var user = require("../config/passport/passport.js");
var models = require("../models");
var passport = require('passport');
var workersUtil = require('../models/.utils/workerUtil.js');
var domaneAccount = require('../models/.utils/domaneAccount.js');
var fixedAssets = require('../models/.utils/fixedAssets.js');
var companyUtil = require('../models/.utils/company.js');
var agreementUtil = require('../models/.utils/agreementsUtil.js');
var positionUtil = require('../models/.utils/position.js');
var teamUtil = require('../models/.utils/teamsUtil.js');
var clientsUtil = require('../models/.utils/clients.js');
var projectsUtil = require('../models/.utils/projects.js');
var jobUtil = require('../models/.utils/job.js');


var models = require("../models");
var exports = module.exports = {}
var workersUtil = require('../models/.utils/workerUtil.js');
var domaneAccount = require('../models/.utils/domaneAccount.js');
var fixedAssetsUtil = require('../models/.utils/fixedAssets.js');
var companyUtil = require('../models/.utils/company.js');
var townUtil = require('../models/.utils/townUtil.js');
var agreementUtil = require('../models/.utils/agreementsUtil.js');
var spec = require('../models/.utils/specialization');
var teamsUtil = require('../models/.utils/teamsUtil.js');

var uploadsPath = path.join(__dirname, '../contracts');

module.exports = function (app, passport) {

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'contracts/');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '.pdf');
        }
    });

    var upload = multer({ storage: storage });

    app.get('/profile', isLoggedIn, controller.profile);
    app.get('/profileEdited', isLoggedIn, controller.profile);
    app.get('/alreadyExists', isLoggedIn, controller.alreadyExists);
    app.get('/fixedAssets', isLoggedIn, controller.fixedAssets);
    app.get('/editCompany', isLoggedIn, companyController.editCompany);
    app.get('/editCompanyAddProfile', isLoggedIn, companyController.editCompanyAddProfile);
    app.get('/editCompanyAddProfileError', isLoggedIn, companyController.editCompanyAddProfileError);
    app.get('/editCompanyAddProfileSuccess', isLoggedIn, companyController.editCompanyAddProfileSuccess);
    app.get('/changePassword', isLoggedIn, controller.changePassword);
    app.get('/passwordChanged', isLoggedIn, controller.passwordChanged);
    app.get('/changePasswordError', isLoggedIn, controller.changePasswordError);
    app.get('/editCompanyEdition', isLoggedIn, companyController.editCompanyEdition);
    app.get('/editCompanySuccess', isLoggedIn, companyController.editCompanySuccess);
    app.get('/settings', isLoggedIn, controller.settings);
    app.get('/humanResources', isLoggedIn, humanResourcesController.humanResources);
    app.get('/production', isLoggedIn, productionController.production);

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/signin');
    }

    //PROFILE
    app.post('/editUser', isLoggedIn, function(req, res){
        var name = req.body.newName;
        var lastName = req.body.newLastName;
        var email = req.body.newEmail;
        var login = req.body.newLogin;

        workersUtil.editUser(req, res, name, lastName, email, login);
    });

    app.post('/changePassword', isLoggedIn, function(req, res){
        var currPassword = req.body.currPassword;
        var newPassword = req.body.newPassword;

        domaneAccount.ifCurrPasswordValid(req.user.IdKontoDomenowe, currPassword).then(function(ifValid){
            if(ifValid){
                domaneAccount.changePassword(req.user.IdKontoDomenowe, newPassword).then(function(){
                    res.redirect('/passwordChanged');
                });
            }else{
                    res.redirect('/changePasswordError');
            }
        });
    });

    //FIXED ASSETS
    app.post('/addAsset', isLoggedIn, function(req, res){
        var name = req.body.name;
        var description = req.body.description;
        var type = req.body.type;
        var price = req.body.price;
        var date = req.body.date;
        var owner = req.body.owner;
        var amount = req.body.amount;
        
        fixedAssets.addAsset(name, description, type, price, date, owner, amount, req.user.IdZespol);
        setTimeout(function(){
            res.redirect('/fixedAssets');
        }, 500);
    });

    app.post('/deleteAsset', isLoggedIn, function(req, resp){
        var idAsset = req.body.asset;
        fixedAssets.deleteAsset(idAsset, req.user.IdZespol).then(function(){
            setTimeout(function(){
                resp.redirect('/fixedAssets');
            }, 500); 
        });
    });

    app.post('/deleteOneAsset', isLoggedIn, function(req, resp){
        var idAsset = req.body.asset;
        fixedAssets.deleteOneasset(idAsset, req.user.IdZespol).then(function(){
            setTimeout(function(){
                resp.redirect('/fixedAssets');
            }, 500);
        })
    });

    app.post('/addOneAsset', isLoggedIn, function(req, resp){
        var idAsset = req.body.asset;
        fixedAssets.addOneAsset(idAsset, req.user.IdZespol).then(function(){
            setTimeout(function(){
                resp.redirect('/fixedAssets');
            }, 500);
        })
    })

    app.post('/editAsset', isLoggedIn, function(req, resp){
        var name = req.body.nameEdit;
        var description = req.body.descriptionEdit;
        var type = req.body.typeEdit;
        var price = req.body.priceEdit;
        var date = req.body.dateEdit;
        var id = req.body.idEdit;

        fixedAssets.editAsset(name, description, type, price, date, id, req.user.IdZespol).then(function(){
            setTimeout(function(){
                resp.redirect('/fixedAssets');
            }, 500); 
        })
    });

    //COMPANY EDIT

    app.post('/addProfile', isLoggedIn, function(req, res){
       
        var login = req.body.login;
        var password = req.body.password;
        var worker = req.body.worker;

        domaneAccount.newAccount(login, password, worker, req.res.IdZespol).then(function(ifOk){
            if(ifOk){
                res.redirect('/editCompany');
            }else{

            }
        })
    });

    app.post('/companyEdition', isLoggedIn, function(req, res){
        var name = req.body.companyName;
        var nip = req.body.companyNip;
        var town = req.body.companyTown;
        var address = req.body.companyAddress;
        var id = req.body.companyId;

        companyUtil.editCompany(name, nip, address,town, id, req.user.IdZespol).then(function(success){
            if(success){
                res.redirect('/editCompanySuccess');
            }
        });
    });

    app.post('/addHuman', upload.single('file-to-upload'), isLoggedIn, function(req, res){
        var name = req.body.name;
        var lastName = req.body.lastName;
        var email = req.body.email;
        var tel = req.body.telephone;
        var superior = req.body.superior;
        var typeOfAgreement = req.body.agreement; // 1 - umowa o prace, 2 - umowa zlecenie, 3 - umowa B2B
        var timeOfContract = req.body.timeOfContract;
        var ifStudent = req.body.ifStudent;
        var ifZus = req.body.ifZus;
        var ifCompetition = req.body.ifCompetition;
        var startDate = req.body.startDate;
        var endDate = req.body.endDate;
        var lumpSum = req.body.lumpSum;
        var hourlyRate = req.body.hourlyRate;
        var companyId = req.body.companyB2b;
        var contractFileLink = req.file.filename;
        var position = req.body.position; // 0 - analityk, 1 - programista
        var spec = req.body.spec;

        
        workersUtil.addProfile(name, lastName, email, tel, superior, req.user.IdZespol, contractFileLink).then(function(user){
            if(position == 1){
                positionUtil.addProgram(user.IdPracownik, spec);
            }else{
                positionUtil.addAnalit(user.IdPracownik, spec);
            }
            if(user == false){
                res.redirect('/editCompanyAddProfileError');
            }else{
                agreementUtil.addAgreement(startDate, endDate, lumpSum, hourlyRate).then(function(agreeId){
                    if(agreeId == false){
                       
                    }else{
                        if(typeOfAgreement == 1){
                            agreementUtil.addOPrace(timeOfContract).then(function(oPrace){
                                agreementUtil.addOPraceToAgree(agreeId, oPrace).then(function(){
                                    workersUtil.addAgreeToHuman(user, agreeId);
                                    res.redirect('/humanResources');
                                })
                            });
                        }
                        if(typeOfAgreement == 2){
                            agreementUtil.addZlecenie(ifStudent, ifZus).then(function(zlecenie){
                                agreementUtil.addZlecenieToAgree(agreeId, zlecenie).then(function(IdAgree){
                                    workersUtil.addAgreeToHuman(user, agreeId);
                                    res.redirect('/humanResources');
                                })
                            });
                        }
                        if(typeOfAgreement == 3){
                            agreementUtil.addB2b(companyId, ifCompetition).then(function(b2bId){
                                agreementUtil.addB2bToAgree(agreeId, b2bId).then(function(){
                                    workersUtil.addAgreeToHuman(user, agreeId);
                                    res.redirect('/humanResources');
                                })
                            });
                        }

                       
                    }
                })
                
            }
        });
    });

    app.post('/editHr', upload.single('file-to-upload'), isLoggedIn, function(req, res){
        var name = req.body.firstNameEdit;
        var lastName = req.body.lastNameEdit;
        var email = req.body.emailEdit;
        var tel = req.body.telephoneEdit;
        var id = req.body.idEdit;
        var contractFileName = req.file.filename;
        var position = req.body.positionEdit;
        var spec = req.body.specEdit;

        workersUtil.editUserfromHr(req, res, name, lastName, email, tel, id, contractFileName, position, spec);
        setTimeout(function(){
            res.redirect('/humanResources');
        }, 500);
    });

    app.post('/deleteHuman', isLoggedIn, function(req, res){
        var workerId = req.body.workerId;

        workersUtil.layOff(workerId).then(function(){
            res.redirect('/humanResources');
        })

    });

    app.post('/addCompany', isLoggedIn, function(req, res){
        var name = req.body.nameCompany;
        var nip = req.body.nipCompany;
        var address = req.body.addressCompany;
        var town = req.body.townCompany;

        companyUtil.addCompany(name, nip, address, town, req.user.IdZespol).then(function(ifOk){
            if(ifOk){
                res.redirect('/humanResources');
            }else{
                console.log("nieeeeee"); //TODO: make something
            }
        });
    });

    app.post('/downloadContract', function (req, res) {
        var fileName1 = req.body.fileName;

        var file = __dirname + '../../contracts/' + fileName1;
        res.download(file);
    });

    app.post('/addTeam', function(req, res){
        var teamName = req.body.teamName;
        var teamsMember = req.body.teamsMember;
       console.log(teamsMember);
        teamUtil.createTeam(teamName, req.user.IdZespol).then(function(teamId){
            teamUtil.createTeamWithWorkers(teamId, teamsMember);
            res.redirect('/humanResources');
        });
    });

    app.post('/editTeams', function(req, res){
        var newName = req.body.newName;
        var idTeam = req.body.idTeam;

        teamUtil.changeTeamName(idTeam, newName, req.user.IdZespol).then(function(){
            res.redirect('/humanResources');
        })
    });

    app.post('/deleteFromTeam', function(req, res){
        var toDelete = req.body.toDelete;
        var idTeam = req.body.idTeam;
        var idTeamEdited = req.body.idTeamEdited;
        teamUtil.deleteFromTeam(toDelete, idTeam).then(function(){
            var teamiii = idTeamEdited.replace("\'", "");
            var teamiiii = teamiii.replace("\'", "");
            domaneAccount.getLogin(req.user.IdKontoDomenowe).then(function (account) {
                workersUtil.getWorkerInfo(account.IdPracownik).then(function (profile) {
                    workersUtil.getWorkers(req.user.IdZespol).then(function (workers) {
                        companyUtil.getAllCopmany(req.user.IdPracownik).then(function (company) {
                            agreementUtil.getAgreeInfo(profile.IdUmowy).then(function (agree) {
                                workersUtil.getAllProgrammers().then(function (programmers) {
                                    workersUtil.getAllAnalit().then(function (analit) {
                                        spec.getAllSpec().then(function (specs) {
                                            teamsUtil.getAllTeams(req.user.IdZespol).then(function (teams) {
                                                teamsUtil.getAllTeamsMembers().then(function (teamsMember) {
                                                    res.render('humanResourcesTeamsEdit', {
                                                        name: profile.Imie,
                                                        site: "Zasoby ludzkie",
                                                        workers: workers,
                                                        company: company,
                                                        agree: agree,
                                                        programmers: programmers,
                                                        analit: analit,
                                                        spec: specs,
                                                        teams: teams,
                                                        teamsMember: teamsMember,
                                                        Team: teamiiii
                                                    })
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        })
    });

    app.post('/addNewMembers', function(req, res){
        var members = req.body.newMembers;
        var idTeam = req.body.idTeam;
        var idTeamEdited = req.body.idTeamEdited;

        teamUtil.addNewMembers(idTeam, members).then(function(){
            var teamiii = idTeamEdited.replace("\'", "");
            var teamiiii = teamiii.replace("\'", "");
            domaneAccount.getLogin(req.user.IdKontoDomenowe).then(function (account) {
                workersUtil.getWorkerInfo(account.IdPracownik).then(function (profile) {
                    workersUtil.getWorkers(req.user.IdZespol).then(function (workers) {
                        companyUtil.getAllCopmany(req.user.IdPracownik).then(function (company) {
                            agreementUtil.getAgreeInfo(profile.IdUmowy).then(function (agree) {
                                workersUtil.getAllProgrammers().then(function (programmers) {
                                    workersUtil.getAllAnalit().then(function (analit) {
                                        spec.getAllSpec().then(function (specs) {
                                            teamsUtil.getAllTeams(req.user.IdZespol).then(function (teams) {
                                                teamsUtil.getAllTeamsMembers().then(function (teamsMember) {
                                                    res.render('humanResourcesTeamsEdit', {
                                                        name: profile.Imie,
                                                        site: "Zasoby ludzkie",
                                                        workers: workers,
                                                        company: company,
                                                        agree: agree,
                                                        programmers: programmers,
                                                        analit: analit,
                                                        spec: specs,
                                                        teams: teams,
                                                        teamsMember: teamsMember,
                                                        Team: teamiiii
                                                    })
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        })
    });

    app.post('/addClient', function(req, res){
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var email = req.body.email;
        var tel = req.body.tel;
        var company = req.body.company;

        clientsUtil.addClient(company,firstName,lastName,tel,email,req.user.IdZespol).then(function(){
            res.redirect('/production');
        });
    });

    app.post('/addCategory', function(req, res){
        var categoryName = req.body.nameCategory;

        projectsUtil.addCategory(categoryName, req.user.IdZespol).then(function(){
            res.redirect('/production');
        });
    });

    app.post('/addProject', function(req, res){
        var projectName = req.body.projectName;
        var client = req.body.client;
        var category = req.body.category;
        var dateFrom = req.body.dateFrom;
        var dateTo = req.body.dateTo;
        var team = req.body.team;
        var description = req.body.description;

        projectsUtil.addProject(projectName, client, category, dateFrom, dateTo, description, req.user.IdZespol).then(function(idProject){
            teamUtil.teamToProject(idProject, team).then(function(){
                res.redirect('/production');            
            })
        })
    });

    app.post('/deleteProject', function(req, res){
        var project = req.body.project;

        teamUtil.deleteProjectsTeam(project).then(function(){
            projectsUtil.deleteProject(project).then(function(){
                res.redirect('/production');
            })
        })
    });

    app.post('/editProject', function(req, res){
        var project = req.body.projectIdEdit;
        var projectName = req.body.nameEdit;
        var client = req.body.clientEdit;
        var category = req.body.categoryEdit;
        var dateFrom = req.body.dateFromEdit;
        var dateTo = req.body.dateToEdit;
        var team = req.body.teamEdit;
        var description = req.body.descriptionEdit;
        var oldTeamId = req.body.oldTeamId;
        
        console.log("nowy team: " + team + ", stary team: " + oldTeamId);


        projectsUtil.updateProject(project, projectName, client, category, dateFrom, dateTo, description, team, oldTeamId).then(function(){
            res.redirect('/production');
        })
    });

    app.post('/addingJob', function(req, res){
        var project = req.body.projectIdJob;
        var name = req.body.nameJob;
        var description = req.body.descriptionJob;
        var status = req.body.status;
        var priority = req.body.priority;
        var worker =req.body.workerJob;

        jobUtil.addJob(project, name, description, status, priority, worker, req.user.IdZespol).then(function(){
            res.redirect('/production');
        });

    });

    app.post('/editTeam', function(req, res){
        
        var idTeam = req.body.idTeamEdit;
        var teamiii = idTeam.replace("\'", "");
        var teamiiii = teamiii.replace("\'", "");
console.log("===============" + idTeam)
        domaneAccount.getLogin(req.user.IdKontoDomenowe).then(function (account) {
            workersUtil.getWorkerInfo(account.IdPracownik).then(function (profile) {
                workersUtil.getWorkers(req.user.IdZespol).then(function (workers) {
                    companyUtil.getAllCopmany(req.user.IdPracownik).then(function (company) {
                        agreementUtil.getAgreeInfo(profile.IdUmowy).then(function (agree) {
                            workersUtil.getAllProgrammers().then(function (programmers) {
                                workersUtil.getAllAnalit().then(function (analit) {
                                    spec.getAllSpec().then(function (specs) {
                                        teamsUtil.getAllTeams(req.user.IdZespol).then(function (teams) {
                                            teamsUtil.getAllTeamsMembers().then(function (teamsMember) {
                                                res.render('humanResourcesTeamsEdit', {
                                                    name: profile.Imie,
                                                    site: "Zasoby ludzkie",
                                                    workers: workers,
                                                    company: company,
                                                    agree: agree,
                                                    programmers: programmers,
                                                    analit: analit,
                                                    spec: specs,
                                                    teams: teams,
                                                    teamsMember: teamsMember,
                                                    Team: teamiiii
                                                })
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

    });

}