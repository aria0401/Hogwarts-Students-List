"use strict";
window.addEventListener("load", start);

let allStudents = [];

const Student = {
  firstName: "",
  middleName: "",
  lastName: "",
  nickName: "",
  image: "",
  house: "",
  gender: "",
  bloodStatus: "",
  prefect: false,
  squad: false,
  expelled: false,
  hacker: false,
};

const settings = {
  filterBy: "Hogwarts",
  sortedBy: "name",
  sortDirection: "asc",
};

const allPrefects = [];

const squad = [];

const expelledStudent = [];

let hasBeenHacked = false;

function start() {
  loadJSON("https://petlatkea.dk/2020/hogwarts/students.json", getStudentObject);
  loadJSON("https://petlatkea.dk/2020/hogwarts/families.json", prepareBlood);
  startFilter();
}

async function loadJSON(url, callback) {
  const response = await fetch(url);
  const jsonData = await response.json();
  callback(jsonData);
}

///////// FILTER THE LIST

function startFilter() {
  document.querySelectorAll('[data-action="filter"]').forEach((element) => {
    element.addEventListener("click", getFilter);
  });

  document.querySelectorAll('[data-action="sort"]').forEach((element) => {
    element.addEventListener("click", getSort);
  });
}

function getFilter(event) {
  const filter = event.target.dataset.filter;
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

function buildList() {
  const currentList = filterFunction(allStudents);
  const sortedList = sortFunction(currentList);
  displayListOfStudents(sortedList);
  textFooterHouse(sortedList);
}

function filterFunction(filteredList) {
  if (settings.filterBy === "Gryffindor") {
    filteredList = allStudents.filter(Gryffindor);
  } else if (settings.filterBy === "Hufflepuff") {
    filteredList = allStudents.filter(Hufflepuff);
  } else if (settings.filterBy === "Ravenclaw") {
    filteredList = allStudents.filter(Ravenclaw);
  } else if (settings.filterBy === "Slytherin") {
    filteredList = allStudents.filter(Slytherin);
  } else if (settings.filterBy === "expelled") {
    filteredList = expelledStudent;
  }

  return filteredList;
}

function Gryffindor(student) {
  return student.house === "Gryffindor";
}
function Hufflepuff(student) {
  return student.house === "Hufflepuff";
}
function Ravenclaw(student) {
  return student.house === "Ravenclaw";
}
function Slytherin(student) {
  return student.house === "Slytherin";
}

///////// SORT THE LIST

function getSort(event) {
  const sort = event.target.dataset.sort;
  const sortDirection = event.target.dataset.sortDirection;
  if (sortDirection === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }
  setSorted(sort, sortDirection);
}

function setSorted(sort, sortDirection) {
  settings.sortedBy = sort;
  settings.sortDirection = sortDirection;
  buildList();
}

function sortFunction(sortedList) {
  let direction = 1;
  if (settings.sortDirection === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }
  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(a, b) {
    if (a[settings.sortedBy] < b[settings.sortedBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  return sortedList;
}

///////// PREPARE STUDENT OBJECT

function getStudentObject(arrayOfStudents) {
  allStudents = arrayOfStudents.map(prepareStudentObject);
  buildList();
}

function prepareStudentObject(eachStudent) {
  const studentObject = Object.create(Student);
  const nickName = eachStudent.fullname.substring(eachStudent.fullname.indexOf('"') + 1, eachStudent.fullname.lastIndexOf('"'));
  const name = eachStudent.fullname.toLowerCase().trim();
  const fullName = name.split(" ");

  if (fullName.length === 1) {
    studentObject.firstName = capitalize(fullName[0]);
    studentObject.lastName = "Null";
  } else if (fullName.length === 2) {
    studentObject.firstName = capitalize(fullName[0]);
    studentObject.lastName = capitalize(fullName[1]);
  } else if (fullName.length > 2) {
    studentObject.firstName = capitalize(fullName[0]);
    studentObject.middleName = capitalize(fullName[1]);
    studentObject.lastName = capitalize(fullName[2]);
  }

  studentObject.house = capitalize(eachStudent.house.toLowerCase().trim());
  studentObject.gender = eachStudent.gender;

  if (studentObject.lastName.includes("-")) {
    studentObject.image = studentObject.lastName.substring(studentObject.lastName.indexOf("-") + 1) + "_" + studentObject.firstName[0].toLowerCase() + ".png";
  } else if (studentObject.lastName.includes("Patil")) {
    studentObject.image = studentObject.lastName.toLowerCase() + "_" + studentObject.firstName.toLowerCase() + ".png";
  } else if (studentObject.lastName !== "Null") {
    studentObject.image = studentObject.lastName.toLowerCase() + "_" + studentObject.firstName[0].toLowerCase() + ".png";
  } else if (studentObject.lastName === "Null") {
    studentObject.image = "default.svg";
  }

  return studentObject;
}

function capitalize(name) {
  let capital = name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase();

  if (name.includes("-")) {
    let split = name.split("-");
    capital =
      split[0].substring(0, 1).toUpperCase() +
      split[0].substring(1).toLowerCase() +
      "-" +
      split[1].substring(0, 1).toUpperCase() +
      split[1].substring(1).toLowerCase();
  }
  if (name.includes('"')) {
    capital = name.substring(name.indexOf('"'), 2).toUpperCase() + name.substring(2).toLowerCase();
  }

  return capital;
}

///////// DISPLAY STUDENT

function displayListOfStudents(studensList) {
  document.querySelector("#list tbody").innerHTML = "";
  studensList.forEach(displayStudent);
}

function displayStudent(student) {
  if (hasBeenHacked) {
    randomBloodStatus(student);
  }

  const clone = document.querySelector("template#student").content.cloneNode(true);

  clone.querySelector("[data-field=firstName]").textContent = student.firstName;
  clone.querySelector("[data-field=lastName]").textContent = student.lastName;
  clone.querySelector("[data-field=house]").textContent = student.house;
  clone.querySelector("[data-field=image]").src = "images/" + student.image;

  ///////////// BLOOD STATUS

  if (student.bloodStatus === "pure") {
    clone.querySelector("[data-img=img_blood]").src = "graphics/pure.svg";
  } else if (student.bloodStatus === "half") {
    clone.querySelector("[data-img=img_blood]").src = "graphics/half2.svg";
  } else if (student.bloodStatus === "muggle") {
    clone.querySelector("[data-img=img_blood]").src = "graphics/muggle.svg";
  }

  ///////////// SQUAD
  if (student.squad === true) {
    clone.querySelector("[data-img=img_squad]").style.opacity = "1";
  } else {
    clone.querySelector("[data-img=img_squad]").style.opacity = ".4";
  }

  clone.querySelector("[data-img=img_squad]").onclick = () => {
    setTimeout(selectSquad, 100, student);
  };

  /////////// EXPELLED

  clone.querySelector("[data-img=img_expelled]").onclick = () => {
    setTimeout(selectExpelled, 100, student);
    document.querySelector(".oh_nej_migu").play();
  };

  /////// PREFECTS
  if (student.prefect === true) {
    clone.querySelector("[data-img=img_prefect]").style.opacity = "1";
  } else {
    clone.querySelector("[data-img=img_prefect]").style.opacity = ".4";
  }

  clone.querySelector("[data-img=img_prefect]").onclick = () => {
    setTimeout(selecPrefect, 100, student);
  };

  /////// CLICK TO SEE DETAILS

  clone.querySelector("[data-field]").addEventListener("click", () => showDetails(student));

  document.querySelector("#list tbody").appendChild(clone);
}

///////// DISPLAY STUDENT'S DETAILS

function showDetails(student) {
  const eachStudent = document.querySelector(".details");
  eachStudent.style.display = "block";
  document.querySelector(".button").addEventListener("click", () => {
    eachStudent.style.display = "none";
  });
  document.querySelector(".studentImage").src = "images/" + student.image;
  // document.querySelector(".house").textContent = `${student.house} `;
  document.querySelector(".details").dataset.theme = `${student.house}`;
  document.querySelector(".house_img").src = "graphics/" + student.house + ".svg";
  if (student.middleName) {
    document.querySelector(".student").textContent = `${student.firstName} ${student.middleName} ${student.lastName}`;
  } else {
    document.querySelector(".student").textContent = `${student.firstName} ${student.lastName}`;
  }

  // if (student.nickName) {
  //   document.querySelector(".nickName").textContent = `${student.nickName}`;
  // }

  if (student.prefect === true) {
    document.querySelector(".prefect_txt").textContent = `Prefect at ${student.house}`;
  } else {
    document.querySelector(".prefect_txt").textContent = `Not a Prefect at ${student.house}`;
  }

  if (student.bloodStatus === "pure") {
    document.querySelector(".blood").src = "graphics/pure.svg";
  } else if (student.bloodStatus === "half") {
    document.querySelector(".blood").src = "graphics/half2.svg";
  } else if (student.bloodStatus === "muggle") {
    document.querySelector(".blood").src = "graphics/muggle.svg";
  }

  if (student.squad === true) {
    document.querySelector(".squad_txt").textContent = `Proud member of the Inquisitorial Squad!`;
  } else {
    document.querySelector(".squad_txt").textContent = "Not a member of the Inquisitorial Squad!";
  }
}

///////// DISPLAY TEXT FOOTER

function textFooterHouse(currentList) {
  document.querySelector("footer p").textContent = `There are ${currentList.length} students in ${settings.filterBy}`;
}

function textFooter() {
  document.querySelector("footer p+p").textContent = `Inquisitorial Squad: ${squad.length} students`;
  document.querySelector("footer p+p+p").textContent = `Expelled students: ${expelledStudent.length}`;
}

///////// ADDING OTHER PROPERTIES TO STUDENT

function prepareBlood(familyObject) {
  let families = familyObject;
  allStudents.forEach((student) => {
    if (families.half.includes(student.lastName)) {
      student.bloodStatus = "half";
    } else if (families.pure.includes(student.lastName) && !families.half.includes(student.lastName)) {
      student.bloodStatus = "pure";
    } else {
      student.bloodStatus = "muggle";
    }
  });
}

function selectExpelled(student) {
  if (student.hacker) {
    student.hacker = true;
  } else if (student.expelled === false) {
    student.expelled = true;
    expelledStudent.push(student);
    textFooter();
    allStudents.splice(allStudents.indexOf(student), 1);
    setTimeout(buildList, 500);
  }

  console.log("expelled is:", expelledStudent);
  // buildList();
}

function selectSquad(student) {
  if (student.bloodStatus === "pure") {
    if (student.squad === true) {
      student.squad = false;
      squad.pop(allStudents.indexOf(student));
    } else {
      student.squad = true;
      squad.push(allStudents.indexOf(student));
    }
  } else {
    document.querySelector(".message_squad").style.visibility = "visible";
  }

  document.querySelector("#message_squad .close_button_squad").onclick = () => {
    document.querySelector(".message_squad").style.visibility = "hidden";
  };

  if (hasBeenHacked) {
    setTimeout(removeFromSquad, 2500, student);
  }

  textFooter();
  buildList();
}

function selecPrefect(student) {
  if (student.prefect === true) {
    student.prefect = false;
  } else {
    choosePrefect(student);
  }
  buildList();
}

function choosePrefect(selectedStudent) {
  const prefects = allStudents.filter((student) => student.prefect);
  const numberOfPrefects = prefects.filter((student) => student.house === selectedStudent.house).length;
  const otherGender = prefects.filter((student) => student.gender === selectedStudent.gender).shift();

  if (numberOfPrefects >= 1) {
    if (otherGender !== undefined) {
      const theOther = allStudents.filter((otherGender) => otherGender.house === selectedStudent.house);
      const gender = theOther.filter((otherGender) => otherGender.gender === selectedStudent.gender);
      const prefect = gender.filter((student) => student.prefect).shift();
      removeOther(prefect);
    }
  }

  displayPrefect(selectedStudent);

  function removeOther(other) {
    const messagePrefect = document.querySelector(".message_prefect");
    const removeButton = document.querySelector(".remove_button");
    messagePrefect.style.visibility = "visible";
    document.querySelector(".message_prefect p").textContent = `${other.firstName} is already Prefect at ${other.house} `;
    removeButton.textContent = `Remove ${other.firstName}`;
    document.querySelector(".ignore_button").onclick = () => {
      messagePrefect.style.visibility = "hidden";
      removePrefect(selectedStudent);
      displayPrefect(other);
      buildList();
    };
    removeButton.onclick = () => {
      messagePrefect.style.visibility = "hidden";
      removePrefect(other);
      displayPrefect(selectedStudent);
      buildList();
    };
    removePrefect(other);
    displayPrefect(selectedStudent);
  }

  function removePrefect(thePrefect) {
    thePrefect.prefect = false;
  }

  function displayPrefect(thePrefect) {
    thePrefect.prefect = true;
    allPrefects.push(thePrefect);
  }
}

///////// HACKING THE SYSTEM

function hackTheSystem() {
  hasBeenHacked = true;
  const myHacker = Object.create(Student);
  myHacker.firstName = "Ariadna";
  myHacker.lastName = "Victorero";
  myHacker.gender = "girl";
  myHacker.house = "Ravenclaw";
  myHacker.image = "default.svg";
  myHacker.hacker = true;
  allStudents.push(myHacker);
}

function randomBloodStatus(student) {
  if (student.bloodStatus === "pure") {
    const values = ["pure", "half", "muggle"];
    const random = Math.floor(Math.random() * values.length);
    student.bloodStatus = values[random];
  }
}

function removeFromSquad(student) {
  student.squad = false;
  squad.pop(allStudents.indexOf(student));
  textFooter();
  buildList();
}
