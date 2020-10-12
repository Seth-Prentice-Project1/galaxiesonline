var firebaseConfig = {
    apiKey: "AIzaSyDaMwKJV4jJFQA8Q0nH4Sj0QUvjbf0j_ns",
    authDomain: "project-1-15cdc.firebaseapp.com",
    databaseURL: "https://project-1-15cdc.firebaseio.com",
    projectId: "project-1-15cdc",
    storageBucket: "project-1-15cdc.appspot.com",
    messagingSenderId: "874912642851",
    appId: "1:874912642851:web:a5c207df4fac46ac94be96",
    measurementId: "G-K5TLFE6BD2"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let db = firebase.database();


//variables
let planetArray = ["andellouxian-6","aughmoore","birkomius","bisschop","brumbaugh","bsw-10-1","clj-0517","drewkaiden","gleam-zanier","gort","gyore","helios","hoefker","jac-110912","jakks","jorg","k-widow","la-torres","leandra","lureena","maia","mared","mj-120210","nagato","nakagawakozi","nibiru","omicron-fenzi","padraign-3110","pembertonia-major","pieds","sargus-36","shouhua","terra-bettia","tifnod","umbra-forum","vici-ks156","vizcarra","walsfeo","zalax","zavondnick"] //this is awful sorry

let activePlanets = [0,0,0,0];//dummy values to avoid issues im not sure exist
let player = "" //set when you click start
let energy = 2;
let culture = 1;
let vp = 0;
let emplv = 1;
let ships = 2;
let numDice = 4;
let emptyPlanets = 4;
let actions = ["move", 'energy', "culture", "diplomacy", "economy", "colony"];
let numRolled = [0, 0, 0, 0, 0, 0]; //the item represented is the position of the entry in actions, sorry
let results = [];
let used = [];
let total = 0;
let activeShip = 0;
let inEcon = false;
let inDip = false;
let currTurn;


//basic functions
function updateEnergy(val){
    if(energy+val>=7){
      energy=7
    }
    else{
      energy+=val
    }
    db.ref("players/" + player).child("energy").set(energy);
}
function updateCulture(val){
    if(culture+val>=7){
      culture=7;
    }
    else{
      culture+=val;
    }
     db.ref("players/" + player).child("culture").set(culture);
}
function updateVictory(val){
  vp+=parseInt(val);
  db.ref("players/" + player).child("vp").set(vp);
  if(vp>=21){
    wrapUp();
  }
}
function updateEmpire(){
  if(emplv<6){
    emplv++;
    db.ref("players/" + player).child("empireLevel").set(emplv);
    switch(emplv){
      case 2:
        updateVictory(1);
        updateNumDice();
        break;
      case 3:
        updateVictory(1);
        db.ref("players/" + player + "/ships/ship3/location").set("dock");
        break;
      case 4:
        updateVictory(1);
        updateNumDice();
        break;
      case 5:
        updateVictory(2);
        db.ref("players/" + player + "/ships/ship4/location").set("dock");
        break;
      case 6:
        updateVictory(3);
        updateNumDice();
        break;
      default:
        console.log("error in empire, not 2-6");
    }
  }
}
function updateNumDice(){
   if(numDice<7){
      numDice++
      db.ref("players/" + player).child("dice").set(numDice);
    }
}
function rollDice(){
  if(currTurn == player){
    console.log(currTurn);
    document.querySelector('#endTurn').style.display = "block";
    results = [];
    numRolled = [0, 0, 0, 0, 0, 0];
    document.querySelector('#moveDie').innerText = `Move die: ${numRolled[0]}`;
    document.querySelector('#energyDie').innerText = `Energy die: ${numRolled[1]}`;
    document.querySelector('#cultureDie').innerText = `Culture die: ${numRolled[2]}`;
    document.querySelector('#economyDie').innerText = `Economy die: ${numRolled[3]}`;
    document.querySelector('#diplomacyDie').innerText = `Diplomacy die: ${numRolled[4]}`;
    document.querySelector('#colonyDie').innerText = `Colony die: ${numRolled[5]}`;
    total = numDice;
    for(let i = 0; i< numDice; i++){
      results.push(actions[Math.floor(Math.random() * actions.length)]);
      switch(results[results.length -1]){
        case "move":
            numRolled[0]++;
            document.querySelector('#moveDie').innerText = `Move die: ${numRolled[0]}`;
            break;
        case "energy":
            numRolled[1]++;
            document.querySelector('#energyDie').innerText = `Energy die: ${numRolled[1]}`;
            break;
        case "culture":
            numRolled[2]++;
            document.querySelector('#cultureDie').innerText = `Culture die: ${numRolled[2]}`;
            break;
        case "economy":
            numRolled[3]++;
            document.querySelector('#economyDie').innerText = `Economy die: ${numRolled[3]}`;
            break;
        case "diplomacy":
            numRolled[4]++;
            document.querySelector('#diplomacyDie').innerText = `Diplomacy die: ${numRolled[4]}`;
            break;
        case "colony":
            numRolled[5]++;
            document.querySelector('#colonyDie').innerText = `Colony die: ${numRolled[5]}`;
            break;
        default:
            console.log("borked in rollDice");
      }
    }
  }
}
function reroll(val){
  total++;
  if(energy>0){
    energy--;
    db.ref("players/" + player).child("energy").set(energy);
    results.push(actions[Math.floor(Math.random() * actions.length)]);
  }
  else{
    results.push(val)
  }
      switch(results[results.length -1]){
        case "move":
            numRolled[0]++;
            document.querySelector('#moveDie').innerText = `Move die: ${numRolled[0]}`;
            break;
        case "energy":
            numRolled[1]++;
            document.querySelector('#energyDie').innerText = `Energy die: ${numRolled[1]}`;
            break;
        case "culture":
            numRolled[2]++;
            document.querySelector('#cultureDie').innerText = `Culture die: ${numRolled[2]}`;
            break;
        case "economy":
            numRolled[3]++;
            document.querySelector('#economyDie').innerText = `Economy die: ${numRolled[3]}`;
            break;
        case "diplomacy":
            numRolled[4]++;
            document.querySelector('#diplomacyDie').innerText = `Diplomacy die: ${numRolled[4]}`;
            break;
        case "colony":
            numRolled[5]++;
            document.querySelector('#colonyDie').innerText = `Colony die: ${numRolled[5]}`;
            break;
        default:
            console.log("borked in reroll");
      }
}
function displayMoveButtons(val){
  if(val){
    document.querySelector('#orbit1').style.display = "block";
    document.querySelector('#surface1').style.display = "block";
    document.querySelector('#orbit2').style.display = "block";
    document.querySelector('#surface2').style.display = "block";
    document.querySelector('#orbit3').style.display = "block";
    document.querySelector('#surface3').style.display = "block";
    document.querySelector('#orbit4').style.display = "block";
    document.querySelector('#surface4').style.display = "block";
    document.querySelector('#dock').style.display = "block";
  }
  else{
    document.querySelector('#orbit1').style.display = "none";
    document.querySelector('#surface1').style.display = "none";
    document.querySelector('#orbit2').style.display = "none";
    document.querySelector('#surface2').style.display = "none";
    document.querySelector('#orbit3').style.display = "none";
    document.querySelector('#surface3').style.display = "none";
    document.querySelector('#orbit4').style.display = "none";
    document.querySelector('#surface4').style.display = "none";
    document.querySelector('#dock').style.display = "none";
  }
}
function checkLevels(){
  console.log("called");
  for(let i = 1; i<5; i++){
    if(document.querySelector("#s" + i + "lv").style.display == "block"){
      db.ref("players/" + player +"/ships/ship" + i).once('value', ss=>{
        let pnum = 0;
        if(document.querySelector("#pname1").innerText == ss.val().location){
          pnum = 1;
        }
        else if(document.querySelector("#pname2").innerText == ss.val().location){
          pnum = 2;
        }
        else if(document.querySelector("#pname3").innerText == ss.val().location){
          pnum = 3;
        }
        else if(document.querySelector("#pname4").innerText == ss.val().location){
          pnum = 4;
        }
        if(ss.val().level > document.querySelector("#plevels" + pnum).innerText.split(" ")[1]){
          updateVictory(document.querySelector("#plevels" + pnum).innerText.split(" ")[1]);
          let planet = activePlanets[pnum];
          while(activePlanets.includes(planet)){
            planet = planetArray[Math.floor(Math.random() * 40)];
          }
          db.ref("active/planet" + pnum).set(planet);
          console.log(activePlanets);
          db.ref("players/" + player +"/ships/ship" + i).set({
            location: "dock",
            level: 0
          });
          document.querySelector("#s" + i + "lv").style.display = "none";
        }   
      });
   }
  }
}
function nextTurn(){
  db.ref("players").once("value", ss=>{
    let arr = []
    ss.forEach(snp=>{
      arr.push(snp.val().name);
    });
    if(arr.indexOf(player) == arr.length -1){
      db.ref("turn").set(arr[0]);
    }
    else{
      db.ref("turn").set(arr[arr.indexOf(player)+1]);
    }
  });
}
function wrapUp(){
  //call for everyone hrm
}

//on click functions
document.querySelector("#start").onclick = function() {
  if(document.querySelector("#nameBox").value !=""){
    db.ref('players/' + document.querySelector("#nameBox").value).set({
     name: document.querySelector("#nameBox").value,
     energy: 2,
     culture: 1,
     vp : 0,
     empireLevel: 1,
     ships: {
       ship1: {
         location: "dock",
         level: 0
       },
       ship2: {
         location: "dock",
         level: 0
       },
       ship3: {
         location: "locked",
         level: 0
       },
       ship4: {
         location: "locked",
         level: 0
       }
     },
     dice: 4
    });
    document.querySelector("#nameBox").style.display = "none";
    document.querySelector("#start").style.display = "none";
    document.querySelector("#container").style.display = "block";
    document.querySelector("#planetMat").style.display = 'block';
    document.querySelector("#log").style.display = "block"
    player = document.querySelector("#nameBox").value;
    document.querySelector("#player").innerText = player;
    console.log(1);
    
    
    db.ref("turn").once("value", ss=>{
      if(ss.val() == "none"){
        db.ref("turn").set(player);
      }
    });
    db.ref("turn").on("value", ss=>{
      if(ss.val() == "none"){
        console.log(2);
        db.ref("players").once("value", snp=>{
          let arr = []
          snp.forEach(snpsht=>{
            arr.push(snpsht.val().name);
          });//loop
          db.ref("turn").set(arr[0]);
        });//players
      }//if
      currTurn = ss.val();
      document.querySelector('#turnHolder').innerText = `Active Player: ${currTurn}`;
    });
    
    db.ref("players").child(document.querySelector("#nameBox").value).child("vp").on('value', ss=>{
      document.querySelector("#victory").innerText = `Victory points: ${ss.val()}`;
     });

    db.ref("players").child(document.querySelector("#nameBox").value).child("energy").on('value', ss=>{
      document.querySelector("#energy").innerText = `Energy: ${ss.val()}`;
     });

    db.ref("players").child(document.querySelector("#nameBox").value).child("culture").on('value', ss=>{
     document.querySelector("#culture").innerText = `Culture: ${ss.val()}`;
    });

    db.ref("players").child(document.querySelector("#nameBox").value).child("dice").on('value', ss=>{
     document.querySelector("#dice").innerText = `Dice: ${ss.val()}`;
    });

  db.ref("players").child(document.querySelector("#nameBox").value).child("empireLevel").on('value', ss=>{
    document.querySelector("#empire").innerText = `Empire Level: ${ss.val()}`;
  });
  }
  
  db.ref("players/" + player +"/ships/ship1").on("value", ss=>{
    document.querySelector("#ship1").innerText = `Ship 1: ${ss.val().location}`
    document.querySelector("#s1lv").innerText = `Level: ${ss.val().level}`
  });
    db.ref("players/" + player +"/ships/ship2").on("value", ss=>{
    document.querySelector("#ship2").innerText = `Ship 2: ${ss.val().location}`
    document.querySelector("#s2lv").innerText = `Level: ${ss.val().level}`
  });
    db.ref("players/" + player +"/ships/ship3").on("value", ss=>{
    document.querySelector("#ship3").innerText = `Ship 3: ${ss.val().location}`
    document.querySelector("#s3lv").innerText = `Level: ${ss.val().level}`
  });
    db.ref("players/" + player +"/ships/ship4").on("value", ss=>{
    document.querySelector("#ship4").innerText = `Ship 4: ${ss.val().location}`
    document.querySelector("#s4lv").innerText = `Level: ${ss.val().level}`
  });
  db.ref("active/planet1").on("value", snp=>{
    activePlanets[0] = snp.val();
    document.querySelector("#pname1").innerText = snp.val();
       db.ref("planet").child(snp.val()).once('value', ss=>{
          if(ss.val().colony == "d"){
            document.querySelector("#pcolony1").innerText = `Colony: Diplomacy`;
          }
          else{
           document.querySelector("#pcolony1").innerText = `Colony: Economy`;
          }
          if(ss.val().resource == "c"){
            document.querySelector("#presource1").innerText = `Resource: Culture`;
          }
          else{
           document.querySelector("#presource1").innerText = `Resource: Energy`;
          }
          document.querySelector("#plevels1").innerText = `Levels: ${ss.val().levels}`;
          document.querySelector("#pvp1").innerText = `Victory Points: ${ss.val().vp}`;
         });
        });
        db.ref("active/planet2").on("value", snp=>{
          activePlanets[1] = snp.val();
          document.querySelector("#pname2").innerText = snp.val();
          db.ref("planet").child(snp.val()).once('value', ss=>{
          if(ss.val().colony == "d"){
            document.querySelector("#pcolony2").innerText = `Colony: Diplomacy`;
          }
          else{
           document.querySelector("#pcolony2").innerText = `Colony: Economy`;
          }
          if(ss.val().resource == "c"){
            document.querySelector("#presource2").innerText = `Resource: Culture`;
          }
          else{
           document.querySelector("#presource2").innerText = `Resource: Energy`;
          }
          document.querySelector("#plevels2").innerText = `Levels: ${ss.val().levels}`;
          document.querySelector("#pvp2").innerText = `Victory Points: ${ss.val().vp}`;
          });
        });
        db.ref("active/planet3").on("value", snp=>{
          activePlanets[2] = snp.val();
          document.querySelector("#pname3").innerText = snp.val();
          db.ref("planet").child(snp.val()).once('value', ss=>{
          if(ss.val().colony == "d"){
            document.querySelector("#pcolony3").innerText = `Colony: Diplomacy`;
          }
          else{
           document.querySelector("#pcolony3").innerText = `Colony: Economy`;
          }
          if(ss.val().resource == "c"){
            document.querySelector("#presource3").innerText = `Resource: Culture`;
          }
          else{
           document.querySelector("#presource3").innerText = `Resource: Energy`;
          }
          document.querySelector("#plevels3").innerText = `Levels: ${ss.val().levels}`;
          document.querySelector("#pvp3").innerText = `Victory Points: ${ss.val().vp}`;
          });
        });
        db.ref("active/planet4").on("value", snp=>{
          activePlanets[3] = snp.val();
          document.querySelector("#pname4").innerText = snp.val();
          db.ref("planet").child(snp.val()).once('value', ss=>{
          if(ss.val().colony == "d"){
            document.querySelector("#pcolony4").innerText = `Colony: Diplomacy`;
          }
          else{
           document.querySelector("#pcolony4").innerText = `Colony: Economy`;
          }
          if(ss.val().resource == "c"){
            document.querySelector("#presource4").innerText = `Resource: Culture`;
          }
          else{
           document.querySelector("#presource4").innerText = `Resource: Energy`;
          }
          document.querySelector("#plevels4").innerText = `Levels: ${ss.val().levels}`;
          document.querySelector("#pvp4").innerText = `Victory Points: ${ss.val().vp}`;
        });
  });
}
document.querySelector('#log').onclick = function(){
  rollDice();
}
document.querySelector('#moveDie').onclick = function(){
  if(numRolled[0]> 0){
    total--;
    numRolled[0]--;
    document.querySelector('#moveDie').innerText = `Move die: ${numRolled[0]}`;
    if(document.querySelector('#rerollCheck').checked == true){
      reroll("move");
    }
  }
  displayMoveButtons(true);
  //put function here
}
document.querySelector('#energyDie').onclick = function(){
  if(numRolled[1]> 0){
    total--;
    numRolled[1]--;
    document.querySelector('#energyDie').innerText = `Energy die: ${numRolled[1]}`;
    if(document.querySelector('#rerollCheck').checked == true){
     reroll("energy");
    }
  }
  let nrg = 0;
  db.ref("players/" + player + "/ships/ship1/location").once("value", ss=>{
    switch(ss.val()){
      case "dock":
        nrg++;
        break;
      case "locked":
        break;
      default:
        db.ref("planet/" + ss.val().substr(0, ss.val().indexOf(" ")) +"/resource").once("value", snp=>{
          if(snp.val() == "e"){
            nrg++;
          }
        });
    }
  });
  db.ref("players/" + player + "/ships/ship2/location").once("value", ss=>{
    switch(ss.val()){
      case "dock":
        nrg++;
        break;
      case "locked":
        break;
      default:
        db.ref("planet/" + ss.val().substr(0, ss.val().indexOf(" ")) + "/resource").once("value", snp=>{
          if(snp.val() == "e"){
            nrg++;
          }   
        });
    }
  });
  db.ref("players/" + player + "/ships/ship3/location").once("value", ss=>{
    switch(ss.val()){
      case "dock":
        nrg++;
        break;
      case "locked":
        break;
      default:
        db.ref("planet/" + ss.val().substr(0, ss.val().indexOf(" ")) + "/resource").once("value", snp=>{
          if(snp.val() == "e"){
            nrg++;
          }   
        });
    }
  });
  db.ref("players/" + player + "/ships/ship4/location").once("value", ss=>{
    switch(ss.val()){
      case "dock":
        nrg++;
        break;
      case "locked":
        break;
      default:
        db.ref("planet/" + ss.val().substr(0, ss.val().indexOf(" ")) + "/resource").once("value", snp=>{
          if(snp.val() == "e"){
            nrg++;
          }   
        });
    }
  });
  updateEnergy(nrg);
}
document.querySelector('#cultureDie').onclick = function(){
  if(numRolled[2]> 0){
    total--;
    numRolled[2]--;
    document.querySelector('#cultureDie').innerText = `Culture die: ${numRolled[2]}`;
    if(document.querySelector('#rerollCheck').checked == true){
      reroll("culture");
    }
  } 
  let cult = 0;
  db.ref("players/" + player + "/ships/ship1/location").once("value", ss=>{
     db.ref("planet/" + ss.val().substr(0, ss.val().indexOf(" ")) +"/resource").once("value", snp=>{
       console.log(snp.val());
       if(snp.val() == "c"){
          cult++;
        }
     });
  });
  db.ref("players/" + player + "/ships/ship2/location").once("value", ss=>{
    db.ref("planet/" + ss.val().substr(0, ss.val().indexOf(" ")) +"/resource").once("value", snp=>{
      console.log(snp.val());
       if(snp.val() == "c"){
          cult++;
        }
     });
  });
  db.ref("players/" + player + "/ships/ship3/location").once("value", ss=>{
    db.ref("planet/" + ss.val().substr(0, ss.val().indexOf(" ")) +"/resource").once("value", snp=>{
      console.log(snp.val());
       if(snp.val() == "c"){
          cult++;
        }
     });
  });
  db.ref("players/" + player + "/ships/ship4/location").once("value", ss=>{
    db.ref("planet/" + ss.val().substr(0, ss.val().indexOf(" ")) +"/resource").once("value", snp=>{
      console.log(snp.val());
       if(snp.val() == "c"){
          cult++;
        }
     });
  });
  updateCulture(cult);
}
document.querySelector('#economyDie').onclick = function(){
  if(numRolled[3]> 0){
    total--;
    numRolled[3]--;
    document.querySelector('#economyDie').innerText = `Economy die: ${numRolled[3]}`;
    if(document.querySelector('#rerollCheck').checked == true){
      reroll("economy");
    }
  }
  for(let i = 1; i<5; i++){
    db.ref("planet/" + document.querySelector('#pname' + i).innerText + "/colony").once("value", ss=>{
      if(ss.val() == "e"){
        for(let j = 1; j<5; j++){
          db.ref("players/" + player + "/ships/ship" + j).once("value", snp=>{
            if(snp.val().location == document.querySelector('#pname' + i).innerText){
              document.querySelector('#planet' + i).style.border = 'black dotted';
              inEcon = true;
            }   
          });
        }
      }
    });
    }
}
document.querySelector('#diplomacyDie').onclick = function(){
  if(numRolled[4]> 0){
    total--;
    numRolled[4]--;
    document.querySelector('#diplomacyDie').innerText = `Diplomacy die: ${numRolled[4]}`;
    if(document.querySelector('#rerollCheck').checked == true){
      reroll("diplomacy");
    }
  }
  for(let i = 1; i<5; i++){
    db.ref("planet/" + document.querySelector('#pname' + i).innerText + "/colony").once("value", ss=>{
      if(ss.val() == "d"){
        for(let j = 1; j<5; j++){
          db.ref("players/" + player + "/ships/ship" + j).once("value", snp=>{
            if(snp.val().location == document.querySelector('#pname' + i).innerText){
              document.querySelector('#planet' + i).style.border = 'black dotted';
              inDip = true;
            }   
          });
        }
      }
    });
    }
}
document.querySelector('#colonyDie').onclick = function(){
  if(numRolled[5]> 0){
    total--;
    numRolled[5]--;
    document.querySelector('#colonyDie').innerText = `Colony die: ${numRolled[5]}`;
    if(document.querySelector('#rerollCheck').checked == true){
     reroll("colony");
    }
  }
  document.querySelector('#energy').style.textShadow = '0 0 3px yellow';
  document.querySelector('#culture').style.textShadow = '0 0 3px yellow';
  document.querySelector('#cancelColony').style.display = "block";
  //put function here
}
document.querySelector('#ship1').onclick = function(){
  db.ref("players/" + player +"/ships/ship1").once("value",ss=>{
    if(ss.val().location != "locked"){
      activeShip = 1;
      document.querySelector('#ship1').style.textShadow = '0 0 3px yellow';
      document.querySelector('#ship2').style.textShadow = 'none';
      document.querySelector('#ship3').style.textShadow = 'none';
      document.querySelector('#ship4').style.textShadow = 'none';
    }});
}
document.querySelector('#ship2').onclick = function(){
  db.ref("players/" + player +"/ships/ship2").once("value",ss=>{
    if(ss.val().location != "locked"){
      activeShip = 2;
      document.querySelector('#ship1').style.textShadow = 'none';
      document.querySelector('#ship2').style.textShadow = '0 0 3px yellow';
      document.querySelector('#ship3').style.textShadow = 'none';
      document.querySelector('#ship4').style.textShadow = 'none';
    }});
}
document.querySelector('#ship3').onclick = function(){
  db.ref("players/" + player +"/ships/ship3").once("value",ss=>{
    if(ss.val().location != "locked"){
      activeShip = 3;
      document.querySelector('#ship1').style.textShadow = 'none';
      document.querySelector('#ship2').style.textShadow = 'none';
      document.querySelector('#ship3').style.textShadow = '0 0 3px yellow';
      document.querySelector('#ship4').style.textShadow = 'none';
    }});
}
document.querySelector('#ship4').onclick = function(){
  db.ref("players/" + player +"/ships/ship4").once("value",ss=>{
    if(ss.val().location != "locked"){
      activeShip = 4;
      document.querySelector('#ship1').style.textShadow = 'none';
      document.querySelector('#ship2').style.textShadow = 'none';
      document.querySelector('#ship3').style.textShadow = 'none';
      document.querySelector('#ship4').style.textShadow = '0 0 3px yellow';
    }});
}
document.querySelector('#orbit1').onclick = function(){
  if(activeShip>0){
    displayMoveButtons(false);
    db.ref("players/" + player + "/ships/ship" + activeShip + "/location").set(document.querySelector('#pname1').innerText);
    db.ref("players/" + player + "/ships/ship" + activeShip + "/level").set(0);
    document.querySelector('#s'+ activeShip+'lv').style.display = "block";
  }
}
document.querySelector('#orbit2').onclick = function(){
  if(activeShip>0){
    displayMoveButtons(false);
    db.ref("players/" + player + "/ships/ship" + activeShip + "/location").set(document.querySelector('#pname2').innerText);
    db.ref("players/" + player + "/ships/ship" + activeShip + "/level").set(0);
    document.querySelector('#s'+ activeShip+'lv').style.display = "block";
  }
}
document.querySelector('#orbit3').onclick = function(){
  if(activeShip>0){
    displayMoveButtons(false);
    db.ref("players/" + player + "/ships/ship" + activeShip + "/location").set(document.querySelector('#pname3').innerText);
    db.ref("players/" + player + "/ships/ship" + activeShip + "/level").set(0);
    document.querySelector('#s'+ activeShip+'lv').style.display = "block";
  }
}
document.querySelector('#orbit4').onclick = function(){
  if(activeShip>0){
    displayMoveButtons(false);
    db.ref("players/" + player + "/ships/ship" + activeShip + "/location").set(document.querySelector('#pname4').innerText);
    db.ref("players/" + player + "/ships/ship" + activeShip + "/level").set(0);
    document.querySelector('#s'+ activeShip+'lv').style.display = "block";
  }
}
document.querySelector('#surface1').onclick = function(){
    if(activeShip>0){
    displayMoveButtons(false);
    db.ref("players/" + player + "/ships/ship" + activeShip + "/location").set(document.querySelector('#pname1').innerText + " surface");
    db.ref("players/" + player + "/ships/ship" + activeShip + "/level").set(-1);
  }
}
document.querySelector('#surface2').onclick = function(){
  if(activeShip>0){
    displayMoveButtons(false);
    db.ref("players/" + player + "/ships/ship" + activeShip + "/location").set(document.querySelector('#pname2').innerText + " surface");
    db.ref("players/" + player + "/ships/ship" + activeShip + "/level").set(-1);
  }
}
document.querySelector('#surface3').onclick = function(){
    if(activeShip>0){
    displayMoveButtons(false);
    db.ref("players/" + player + "/ships/ship" + activeShip + "/location").set(document.querySelector('#pname3').innerText + " surface");
    db.ref("players/" + player + "/ships/ship" + activeShip + "/level").set(-1);
  }
}
document.querySelector('#surface4').onclick = function(){
    if(activeShip>0){
    displayMoveButtons(false);
    db.ref("players/" + player + "/ships/ship" + activeShip + "/location").set(document.querySelector('#pname4').innerText + " surface");
    db.ref("players/" + player + "/ships/ship" + activeShip + "/level").set(-1);
  }
}
document.querySelector('#dock').onclick = function(){
  if(activeShip>0){
    displayMoveButtons(false);
    db.ref("players/" + player + "/ships/ship" + activeShip + "/location").set("dock");
    db.ref("players/" + player + "/ships/ship" + activeShip + "/level").set(0);
    document.querySelector('#s'+ activeShip+'lv').style.display = "none";
  }
}
document.querySelector('#energy').onclick = function(){
  if(document.querySelector('#energy').style.textShadow != 'none' && energy >= emplv + 1){
    document.querySelector('#energy').style.textShadow = 'none';
    document.querySelector('#culture').style.textShadow = 'none';
    document.querySelector('#cancelColony').style.display = "none";
    updateEnergy(-(emplv + 1));
    updateEmpire();
  }
}
document.querySelector('#culture').onclick = function(){
  if(document.querySelector('#culture').style.textShadow != 'none' && cultrure >= emplv + 1){
    document.querySelector('#culture').style.textShadow = 'none';
    document.querySelector('#energy').style.textShadow = 'none';
    document.querySelector('#cancelColony').style.display = "none";
    updateCulture(-(emplv + 1));
    updateEmpire();
  }
}
document.querySelector('#cancelColony').onclick = function(){
  numRolled[5]++;
  document.querySelector('#colonyDie').innerText = `Colony die: ${numRolled[5]}`;
  document.querySelector('#culture').style.textShadow = 'none';
  document.querySelector('#energy').style.textShadow = 'none';
  document.querySelector('#cancelColony').style.display = "none";
}
document.querySelector('#planet1').onclick = function(){
  if(document.querySelector('#planet1').style.border != "none" && (inEcon || inDip)){
    inEcon = false;
    inDip = false;
    document.querySelector('#planet1').style.border = "none"
    for(let i = 1; i<5; i++){
      db.ref("players/" + player + "/ships/ship" + i).once("value", ss=>{
        if(ss.val().location == document.querySelector('#pname1').innerText){
          db.ref("players/" + player + "/ships/ship" + i + "/level").set(ss.val().level + 1);
          checkLevels();
        }
      });
    }
  }
}
document.querySelector('#planet2').onclick = function(){
  if(document.querySelector('#planet2').style.border != "none" && (inEcon||inDip)){
    inEcon = false;
    inDip = false;
    document.querySelector('#planet2').style.border = "none"
    for(let i = 1; i<5; i++){
      db.ref("players/" + player + "/ships/ship" + i).once("value", ss=>{
        if(ss.val().location == document.querySelector('#pname2').innerText){
          db.ref("players/" + player + "/ships/ship" + i + "/level").set(ss.val().level + 1);
          checkLevels();
        }
      });
    }
  }
}
document.querySelector('#planet3').onclick = function(){
  console.log("p3 clicked");
  if(document.querySelector('#planet3').style.border != "none" && (inEcon||inDip)){
    inEcon = false;
    inDip = false;
    document.querySelector('#planet3').style.border = "none"
    for(let i = 1; i<5; i++){
      db.ref("players/" + player + "/ships/ship" + i).once("value", ss=>{
        if(ss.val().location == document.querySelector('#pname3').innerText){
          db.ref("players/" + player + "/ships/ship" + i + "/level").set(ss.val().level + 1);
          checkLevels()
        }
      });
    }
  }
}
document.querySelector('#planet4').onclick = function(){
  console.log("p4 clicked");
  if(document.querySelector('#planet4').style.border != "none" && (inEcon||inDip)){
    inEcon = false;
    inDip = false;
    document.querySelector('#planet4').style.border = "none"
    for(let i = 1; i<5; i++){
      db.ref("players/" + player + "/ships/ship" + i).once("value", ss=>{
        if(ss.val().location == document.querySelector('#pname4').innerText){
          db.ref("players/" + player + "/ships/ship" + i + "/level").set(ss.val().level + 1);
          checkLevels();
        }
      });
    }
  }
}
document.querySelector('#endTurn').onclick = function(){
  document.querySelector('#endTurn').style.display = "none";
  nextTurn();
}

//event listeners
window.addEventListener('beforeunload', e=>{
  if(currTurn == player){
    db.ref("turn").set("none")
  }
  db.ref("players/"+ player).remove();
});
