let currentResult = {};
let previousDoseUnit = "mcg";
guideLine1.className = "guide-warning";

function readInputs() {

    const peptide = document.getElementById("peptide").value;

    const vialStrength = Number(document.getElementById("vialStrength").value);

    const waterAmount = Number(document.getElementById("waterAmount").value);

    const waterUnit = document.getElementById("waterUnit").value;

    const dose = Number(document.getElementById("dose").value);

    const doseUnit = document.getElementById("doseUnit").value;

    const activeButton =
    document.querySelector(".syringe-btn.active");

     let syringeUnits = activeButton.dataset.units;

     if (syringeUnits === "custom") {

         syringeUnits = 
            Number(document.getElementById("customSyringe").value) || 100;
           

}

    return {

        peptide,

        vialStrength,

        waterAmount,

        waterUnit,

        dose,

        doseUnit,

        syringeUnits

    };

}
const syringeButtons = document.querySelectorAll(".syringe-btn");
const customField =
    document.getElementById("customSyringeField");

syringeButtons.forEach(button => {

    button.addEventListener("click", () => {

        syringeButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");
        

        if(button.dataset.units === "custom"){

            customField.classList.add("show");
            document.getElementById("customSyringe").focus();

        }else{

            customField.classList.remove("show");

        }
        updateCalculation();
        console.log("Selected:", button.dataset.units);


    });

}
);
function updateCalculation() {

    const input = readInputs();

    

    // Prevent calculations while a required input is temporarily empty
    // (for example, when the user selects all text in Vial Strength and deletes it).
    // Without this guard, an empty vial strength becomes 0, which can produce
    // Infinity and cause updateSyringePreview() to loop indefinitely.
    const syringeCapacity = Number(input.syringeUnits);

    if (
        !Number.isFinite(input.vialStrength) || input.vialStrength <= 0 ||
        !Number.isFinite(input.waterAmount) || input.waterAmount <= 0 ||
        !Number.isFinite(input.dose) || input.dose <= 0 ||
        !Number.isFinite(syringeCapacity) || syringeCapacity <= 0
    ) {
        document.getElementById("drawIU").textContent = "--";
        document.getElementById("drawML").textContent = "--";
        document.getElementById("concentrationValue").textContent = "--";
        document.getElementById("totalDoseValue").textContent = "--";

        document.getElementById("syringeFill").style.width = "0%";

        updateSyringePreview(0, syringeCapacity);
        return;
    }

    // Convert dose to mg if needed
    let doseMg =
        input.doseUnit === "mcg"
            ? input.dose / 1000
            : input.dose;

    // Convert vial strength to mg if needed
    const vialMg = input.vialStrength;

    // Concentration (mg/mL)
    const concentration =
        vialMg / input.waterAmount;

    // Volume to draw (mL)
    const drawMl =
        doseMg / concentration;

    // IU to draw
    const drawIU = drawMl * 100;

    // Total doses
    const totalDoses =
        vialMg / doseMg;

    console.log({
        concentration,
        drawMl,
        drawIU,
        totalDoses
    });
    document.getElementById("drawIU").textContent =
    drawIU.toFixed(2) + " IU";

document.getElementById("drawML").textContent =
    drawMl.toFixed(2) + " mL";

document.getElementById("concentrationValue").textContent =
    concentration.toFixed(2) + " mg/mL";

document.getElementById("totalDoseValue").textContent =
    totalDoses.toFixed(2).replace(/\.00$/, "");
    

const percentage =
    (drawIU / syringeCapacity) * 100;
const markerPosition = Math.min(percentage, 100);

    document.getElementById("syringeFill").style.width =
    Math.min(percentage,100) + "%";


updateSyringePreview(
    drawIU,
    Number(input.syringeUnits)
    
);
currentResult = {

    input,

    drawIU,

    drawMl,

    concentration,

    totalDoses

};

updateShareCard(

     input,

    drawIU,

    drawMl,

    concentration,

    totalDoses

);
}
function updateSyringePreview(drawIU, syringeCapacity){

    const numbers =
    document.getElementById("syringeNumbers"); 

    const marker =
    document.getElementById("drawMarker");

        const tickContainer =
    document.getElementById("tickContainer");

   

    tickContainer.innerHTML = "";

    numbers.innerHTML = "";

    let majorStep;

    if(syringeCapacity <= 30){

        majorStep = 5;

    }

    else if(syringeCapacity <= 50){

        majorStep = 10;

    }

    else{

        majorStep = 10;

    }

    for(let i = 0; i <= syringeCapacity; i++){

    const tick = document.createElement("div");
    tick.className = "tick";

    if(i === syringeCapacity){

    tick.classList.add("major");

}
else if(i % 10 === 0){

    tick.classList.add("major");

}
else if(i % 5 === 0){

    tick.classList.add("medium");

}
else{

    tick.classList.add("minor");

}

    // ⭐ THIS WAS MISSING
    const percent = (i / syringeCapacity) * 100;

if (i === 0) {
    tick.style.left = "1.5px";
}
else if (i === syringeCapacity) {
    tick.style.left = "calc(100% - 1.5px)";
}
else {
    tick.style.left = percent + "%";
}

    tickContainer.appendChild(tick);

}

 for (let i = 0; i <= syringeCapacity; i += majorStep) {

    const label = document.createElement("span");

    label.textContent = i;

    numbers.appendChild(label);

}

// Add the last label if it isn't already there
if (syringeCapacity % majorStep !== 0) {

    const label = document.createElement("span");

    label.textContent = syringeCapacity;

    numbers.appendChild(label);

}

    const percentage =
    Math.min((drawIU / syringeCapacity) * 100, 100);
    
   const overCapacity = drawIU > syringeCapacity;

document.getElementById("syringeFill").style.width =
    percentage + "%";

const markerPosition =
    Math.min((drawIU / syringeCapacity) * 100, 100);

marker.style.left =
    markerPosition + "%";

marker.classList.toggle("warning", overCapacity);
const roundedIU =
    Math.round(drawIU * 10) / 10;

const fullShots =
    Math.floor(drawIU / syringeCapacity);

const remainder =
    drawIU % syringeCapacity;

const markerLabel =
    document.getElementById("drawMarkerLabel");


if (overCapacity) {

    let injections = [];

    for(let i = 0; i < fullShots; i++){

        injections.push(syringeCapacity + " IU");

    }

    if(remainder > 0){

        injections.push(remainder.toFixed(1).replace(".0","") + " IU");
        

    }

    markerLabel.innerHTML =
    `⚠ Requires <br>${injections.length} injections<br>` +
    injections.join("<br>");
     marker.style.transform = "translateX(-70%)";

}
else{

    markerLabel.textContent =
        "Draw to " + roundedIU + " IU";
        marker.style.transform = "translateX(-50%)";

}


}


const inputs = document.querySelectorAll("input, select");

inputs.forEach(input => {

    input.addEventListener("input", updateCalculation);

    input.addEventListener("change", updateCalculation);

});

// Listen specifically for the Custom Syringe input
document.getElementById("customSyringe")
    .addEventListener("input", updateCalculation);

    document.getElementById("doseUnit")
    .addEventListener("change", convertDoseUnit);

function updateShareCard(input, drawIU, drawMl, concentration, totalDoses){

    const roundedIU =
     Number(drawIU.toFixed(1));

     const roundedML =
    Number(drawMl.toFixed(2));

    const roundedDoses =
    Math.round(totalDoses);

    const overCapacity =
    roundedIU > input.syringeUnits;


    let readableDose;

if (input.doseUnit === "mcg") {

    if (input.dose >= 1000) {

        readableDose =
            Number((input.dose / 1000).toFixed(2)) + " mg";

    } else {

        readableDose =
            input.dose + " mcg";

    }

} else {

    readableDose =
        input.dose + " mg";

}

    if (!overCapacity) {

    document.getElementById("guideLine1").textContent =
        `✓ Draw ${roundedIU} IU on a ${input.syringeUnits} IU syringe`;

    document.getElementById("guideLine2").textContent =
        `✓ Delivers:  ${readableDose}`;

    document.getElementById("guideLine3").textContent =
        `✓ Injection volume: ${roundedML} mL`;

    document.getElementById("guideLine4").textContent =
        `✓ Approximately  ${roundedDoses} doses per vial`;

}
else {
const fullShots =
    Math.floor(roundedIU / input.syringeUnits);

const remainder =
    Number((roundedIU % input.syringeUnits).toFixed(1));

let parts = [];

for (let i = 0; i < fullShots; i++) {
    parts.push(input.syringeUnits + " IU");
}

if (remainder > 0) {
    parts.push(remainder + " IU");
}

document.getElementById("guideLine1").textContent =
    `⚠ Split into ${parts.length} injections`;

document.getElementById("guideLine2").textContent =
    `• ${parts.join(" + ")}`;

document.getElementById("guideLine3").textContent =
    `✓ Delivers ${readableDose}`;

document.getElementById("guideLine4").textContent =
    `✓ Total injection volume: ${roundedML} mL`;

document.getElementById("guideLine5").textContent =
    `✓ Use a ${input.syringeUnits} IU syringe`;

}
    document.getElementById("sharePeptide").textContent =
        input.peptide;
        document.getElementById("shareSyringe").textContent =
    input.syringeUnits + " IU";
    document.getElementById("shareDose").textContent =
    input.dose + " " + input.doseUnit;

    document.getElementById("shareDraw").textContent =
    Number(drawIU.toFixed(1)) + " IU"

    document.getElementById("shareVolume").textContent =
        drawMl.toFixed(2) + " mL";

    document.getElementById("shareConcentration").textContent =
        concentration.toFixed(2) + " mg/mL";

    document.getElementById("shareTotalDoses").textContent =
        totalDoses.toFixed(2).replace(/\.00$/,"");
        //updateShareSyringe(drawIU, syringeCapacity);
      const today = new Date();

const formattedDate =
    today.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).replace(/ /g, "-");

document.getElementById("shareDate").textContent =
    formattedDate;

}   

updateCalculation();
document
   .getElementById("saveBtn")
    .addEventListener("click", saveResult);
document
    .getElementById("shareBtn")
    .addEventListener("click", shareResult);
function saveResult() {

    const card =
        document.getElementById("shareCard");

    html2canvas(card, {
        backgroundColor: "#ffffff",
        scale: 2
    }).then(canvas => {

        const link =
            document.createElement("a");

        link.download =
            "peptide-calculation.png";

        link.href =
            canvas.toDataURL("image/png");

        link.click();

    });

}
async function shareResult() {

    const card =
        document.getElementById("shareCard");

    const canvas =
        await html2canvas(card, {
            backgroundColor: "#ffffff",
            scale: 2
        });

    canvas.toBlob(async (blob) => {

        const file = new File(
            [blob],
            "peptide-calculation.png",
            { type: "image/png" }
        );

        if (
            navigator.canShare &&
            navigator.canShare({ files: [file] })
        ) {

            await navigator.share({
                title: "Peptide Calculator",
                text: "Generated using PeptideCalc Pro",
                files: [file]
            });

        } else {

            const link =
                document.createElement("a");

            link.download = "peptide-calculation.png";
            link.href = URL.createObjectURL(blob);
            link.click();

        }

    }, "image/png");

}

function convertDoseUnit(){

    let dose =
        parseFloat(document.getElementById("dose").value);

    if(isNaN(dose)) return;

    const currentUnit =
        document.getElementById("doseUnit").value;

    if(previousDoseUnit === "mcg" && currentUnit === "mg"){

        dose = dose / 1000;

    }
    else if(previousDoseUnit === "mg" && currentUnit === "mcg"){

        dose = dose * 1000;

    }

    document.getElementById("dose").value =
        Number(dose.toFixed(3));

    previousDoseUnit = currentUnit;

    updateCalculation();

}
const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");

const overlay =
    document.getElementById("overlay");

menuBtn.addEventListener("click", () => {

    sidebar.classList.add("open");

    overlay.classList.add("show");

});

overlay.addEventListener("click", () => {

    sidebar.classList.remove("open");

    overlay.classList.remove("show");

});


// ===============================
// SIDEBAR DARK MODE
// ===============================

const darkModeToggle = document.getElementById("darkModeToggle");

function applyTheme(theme) {

    document.documentElement.classList.toggle(
        "dark-mode",
        theme === "dark"
    );

    if (darkModeToggle) {
        darkModeToggle.textContent =
            theme === "dark"
                ? "☀️ Light Mode"
                : "🌙 Dark Mode";
    }
}

// Load saved theme
const savedTheme = localStorage.getItem("peptidecalc-theme");

if (savedTheme === "dark" || savedTheme === "light") {

    applyTheme(savedTheme);

} else if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
) {

    applyTheme("dark");

} else {

    applyTheme("light");

}


// Toggle theme when sidebar item is clicked
if (darkModeToggle) {

    darkModeToggle.addEventListener("click", () => {

        const isDark =
            document.documentElement.classList.contains("dark-mode");

        const newTheme =
            isDark ? "light" : "dark";

        localStorage.setItem(
            "peptidecalc-theme",
            newTheme
        );

        applyTheme(newTheme);

    });

}
