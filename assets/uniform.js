/*
    Copyright (c) 2025 Benjamin O'Brien. All rights reserved.
    Licensed to Grenada NJROTC under a custom software license agreement.
*/

const mainElement = document.querySelector("main");
const uniformCriteria = await (await fetch("/criteria.json")).json();

const DEFAULT_STANDARD = "Male Service Uniform";

class UniformHandler {
    constructor() {
        this.entries = [];
        this.index = null;

        // Initialization step
        this.setCurrentStandard(DEFAULT_STANDARD);
    }

    save(resave) {
        const values = {};
        for (const checkbox of mainElement.querySelectorAll(`input[type = "checkbox"]`)) values[checkbox.id] = checkbox.checked;

        const data = {
            name: mainElement.querySelector("#name").value,
            standard: mainElement.querySelector("select").value,
            values: values
        }

        if (resave) {
            this.entries[this.index - 1] = data;
            return;
        }

        this.entries.push(data);
        this.setCurrentStandard(DEFAULT_STANDARD);
        document.getElementById("back").removeAttribute("disabled");
    }

    load() {
        const { name, standard, values } = this.entries[this.index];
        this.setCurrentStandard(standard);
        mainElement.querySelector("#name").value = name;
        mainElement.querySelector("select").value = standard;
        for (const id in values) mainElement.querySelector(`#${id}`).checked = values[id];
    }

    setCurrentStandard(standard) {
        mainElement.innerHTML = `
            <div>
                <label>Cadet Name</label>
                <input id = "name" type = "text">
            </div>
            <div>
                <label>Grading As</label>
                <select>
                    ${Object.entries(uniformCriteria.standards).map(([type, _]) => `<option value = "${type}"${type === standard ? "selected" : ""}>${type}</option>`).join("")}
                </select>
            </div>
            <div class = "space"></div>
            <hr>
            <div class = "button-list">
                <button id = "done">Done</button>
                <div class = "space"></div>
                <span></span>
                <div class = "space"></div>
                <button id = "back"${this.index === 0 || !this.entries.length ? "disabled" : ""}>Back</button>
                <button id = "next">Next</button>
            </div>
        `;
        mainElement.querySelector(".button-list span").innerText = `${(this.index === null ? this.entries.length : this.index) + 1} / ${this.entries.length + 1}`;
    
        // Handle loading standard requirements
        for (const item of uniformCriteria.standards[standard]) {
            const object = uniformCriteria.criteria[item.name];
            const element = document.createElement("div");
            element.innerHTML = item.type === "section" ? `<span>${item.name}</span>` : `
                <label for = "${item.name}">
                    ${object.details ? `
                        <div class = "info-icon">
                            i
                            <div class = "tooltip">${object.details}</div>
                        </div>` : ""}
                    ${object.name}
                </label>
                <input type = "checkbox" id = "${item.name}">
            `;
            element.classList = item.type === "section" ? "section-separator" : "";
            mainElement.insertBefore(element, mainElement.querySelector(".space"))
        }
    
        // Handle changing the uniform standard
        mainElement.querySelector("select").addEventListener("change", (e) => this.setCurrentStandard(e.currentTarget.value));

        // Handle buttons
        document.getElementById("done").addEventListener("click", () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.autoTable({
                head: [["Last name", "First name", "Grade"]],
                body: this.entries.map((e) => [
                    ...e.name.split(" ").reverse(),
                    Math.round(Object.entries(e.values).filter(([_, value]) => value).map(([key]) => key).map((x) => uniformCriteria.criteria[x].score).reduce((a, c) => a + c, 0))
                ])
            });
            doc.save("Uniform Scores.pdf");
        });
        document.getElementById("back").addEventListener("click", (e) => {
            if (this.index === null && this.entries.length) this.index = this.entries.length - 1;
            else if (this.index) this.index--;
            this.load();
            if (this.index) e.currentTarget.removeAttribute("disabled");
            else e.currentTarget.setAttribute("disabled", "");
        });
        document.getElementById("next").addEventListener("click", () => {
            if (!mainElement.querySelector("#name").value.trim()) {
                mainElement.querySelector("#name").classList = "invalid";
                return;
            }
            if (this.index !== null) this.index++;
            if (this.index === null) return this.save();
            this.save(true);
            if (this.index === this.entries.length) this.index = null;
            if (this.index !== null) this.load();
            else this.setCurrentStandard(DEFAULT_STANDARD);
        });
    }
}

new UniformHandler();
