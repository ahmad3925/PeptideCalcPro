function readInputs() {

    const peptide = document.getElementById("peptide").value;

    const vialStrength = Number(document.getElementById("vialStrength").value);

    const vialStrengthUnit = document.getElementById("vialStrengthUnit").value;

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

        vialStrengthUnit,

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

    // Convert dose to mg if needed
    let doseMg =
        input.doseUnit === "mcg"
            ? input.dose / 1000
            : input.dose;

    // Convert vial strength to mg if needed
    let vialMg =
        input.vialStrengthUnit === "mcg"
            ? input.vialStrength / 1000
            : input.vialStrength;

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

    

const syringeCapacity =
    Number(input.syringeUnits);

const percentage =
    (drawIU / syringeCapacity) * 100;

    document.getElementById("syringeFill").style.width =
    Math.min(percentage,100) + "%";


updateSyringePreview(
    drawIU,
    Number(input.syringeUnits)
);
}
function updateSyringePreview(drawIU, syringeCapacity){

    const numbers =
        document.getElementById("syringeNumbers");

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

    if(i % 10 === 0){
        tick.classList.add("major");
    }
    else if(i % 5 === 0){
        tick.classList.add("medium");
    }
    else{
        tick.classList.add("minor");
    }

    // ⭐ THIS WAS MISSING
    tick.style.left = (i / syringeCapacity) * 100 + "%";

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

    document.getElementById("syringeFill").style.width =
        Math.min(drawIU / syringeCapacity * 100,100) + "%";

    document.getElementById("previewText").textContent =
        "Draw " + drawIU.toFixed(2) + " IU";

}
const inputs = document.querySelectorAll("input, select");

inputs.forEach(input => {

    input.addEventListener("input", updateCalculation);

    input.addEventListener("change", updateCalculation);

});

// Listen specifically for the Custom Syringe input
document.getElementById("customSyringe")
    .addEventListener("input", updateCalculation);

updateCalculation();