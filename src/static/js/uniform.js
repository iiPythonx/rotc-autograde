/*
    Copyright (c) 2025 Benjamin O'Brien. All rights reserved.
    Licensed to Grenada NJROTC under a custom software license agreement.
*/

const data = await (await fetch("/criteria.json")).json();
const main = document.querySelector("main");

const DEFAULT_STANDARD = "Male Service Uniform";
const notyf = new Notyf();

new (class {
    constructor() {
        this.criteria = data.criteria;
        this.standards = data.standards;

        this.people = [];
        this.editing_index = null;

        main.innerHTML = `<section>No people yet.</section><section></section>`;
        this.list = main.querySelector("section:first-child");
        this.form = main.querySelector("section:last-child");

        this.show_edit_form();
    }

    get_values() {
        return {
            name: this.form.querySelector("input#name").value,
            standard: this.form.querySelector("select").value,
            values: Object.fromEntries(Array.from(this.form.querySelectorAll(`input[type = "checkbox"]`)).map(c => [c.id, c.checked]))
        }
    }

    create_form(standard) {
        this.form.innerHTML = `
            <div>
                <label>Cadet name</label>
                <input type = "text" placeholder = "John Doe" id = "name">
            </div>
            <div>
                <label>Grading As</label>
                <select>
                    ${Object.entries(this.standards).map(([type, _]) => `<option value = "${type}"${type === standard ? "selected" : ""}>${type}</option>`).join("")}
                </select>
            </div>
            <div class = "space"></div>
            <hr>
            <div class = "button-list">
                ${this.editing_index === null ? "<button id = 'reset'>Reset</button>" : ""}
                <div class = "space"></div>
                <button id = "add">${this.editing_index === null ? "Add Grade" : "Edit Grade"}</button>
            </div>
        `;

        // Handle loading standard requirements
        for (const item of this.standards[standard]) {
            const object = this.criteria[item.name];
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
            this.form.insertBefore(element, this.form.querySelector(".space"))
        }

        // Handle changing the uniform standard
        this.form.querySelector("select").addEventListener("change", (e) => {
            const stored_name = this.form.querySelector("input#name").value;
            this.create_form(e.currentTarget.value);
            if (stored_name.trim()) this.form.querySelector("input#name").value = stored_name;
        });

        const submit = () => {
            const { name, standard, values } = this.get_values();
            if (!name.trim()) return notyf.error("Name must be present in order to add a grade!");
            if (this.editing_index !== null) this.people[this.editing_index] = { name, standard, values };
            else this.people.push({ name, standard, values });
            this.editing_index = null;
            this.draw_people();
            this.create_form(DEFAULT_STANDARD);
        }

        document.querySelector(`input[type = "text"]`).addEventListener("keypress", (e) => {
            if (e.key === "Enter") submit();
        });
        document.querySelector(`input[type = "text"]`).focus();
        document.getElementById("add").addEventListener("click", submit);
        if (this.editing_index === null) document.getElementById("reset").addEventListener("click", () => this.create_form(DEFAULT_STANDARD));
    }

    show_edit_form() {
        if (this.editing_index) {
            const { name, standard, values } = this.people[this.editing_index];
            this.create_form(standard);
            this.form.querySelector("input#name").value = name;
            for (const id in values) this.form.querySelector(`#${id}`).checked = values[id];
            return;
        }
        this.create_form(DEFAULT_STANDARD);
    }

    draw_people() {
        this.list.innerHTML = `<div></div><hr><button id = "finished">Finished</button>`;

        let active_element;
        for (const index in this.people) {
            const div = document.createElement("div");
            div.innerHTML = `
                <h3>${this.people[index].name}</h3>
                <button id = "edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                        <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
                    </svg>
                </button>
                <button id = "delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                    </svg>
                </button>
            `;
            div.classList.add("person");
            if (index == this.editing_index) {
                div.classList.add("active");
                active_element = div;
            };
            div.querySelector("#edit").addEventListener("click", () => {
                this.editing_index = this.editing_index === index ? null : index;
                this.draw_people();
                this.show_edit_form();
            });
            div.querySelector("#delete").addEventListener("click", () => {
                if (index < this.editing_index) {
                    this.editing_index--;
                } else if (index > this.editing_index) {
                    this.editing_index++;
                } else if (index == this.editing_index) {
                    this.editing_index = null;
                }
                if (this.editing_index === null) this.create_form(DEFAULT_STANDARD);
                this.people.splice(index, 1);
                this.draw_people();
            });
            this.list.querySelector("div:first-child").appendChild(div);
        }
        if (!this.people.length) this.list.innerText = "No people yet.";
        this.list.querySelector("#finished").addEventListener("click", () => this.generate_pdf());
        this.list.querySelector("div:first-child").scrollTop = this.list.querySelector("div:first-child").scrollHeight;
        if (active_element) active_element.scrollIntoView({ behavior: "auto", block: "nearest" });
    }

    generate_pdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.autoTable({
            head: [["Last name", "First name", "Grade"]],
            body: this.people.map((e) => {
                const name = e.name.split(" ").reverse();
                const points = Object.entries(e.values).filter(([_, value]) => value).map(([key]) => key).map((x) => this.criteria[x].score);
                return [
                    ...(name.length === 1 ? ["", name] : name),
                    `${Math.round(points.reduce((a, c) => a + c, 0) * 10) / 10}%`
                ]
            }),
            margin: { top: 20 }
        });
        doc.text("NJROTC Autograde", 5, 10);
        doc.setFontSize(8);
        doc.text(`Report accurate as of ${new Date()}.`, 5, 15);
        doc.save("Uniform Scores.pdf");
    }
});
