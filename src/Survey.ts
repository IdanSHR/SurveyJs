interface Question {
    text: string;
    type: "text" | "email" | "tel" | "number" | "date" | "time" | "datetime-local" | "radio" | "checkbox" | "select" | "textarea";
    answers?: string[];
    maxCharacters?: number;
    required?: boolean;
    placeholder?: string;
    validation?: RegExp;
    options?: { label: string; value: string }[];
    multiple?: boolean;
    minValue?: number;
    maxValue?: number;
    step?: number;
    customComponent?: any; // Update the type as per your custom component requirements
    conditional?: { questionId: string; value: string }[];
}

interface Options {
    webhookUrl?: string;
    style?: string;
}

class Survey {
    private container: HTMLElement | null;
    private questions: Question[] = [];
    private options: Options = {};

    constructor(containerId: string, questions: Question[], options?: Options) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Could not find container element with ID ${containerId}`);
            return;
        }
        this.questions = questions;

        if (options) {
            this.options = options;
        }

        this.render();
    }

    private render() {
        const form = document.createElement("form");
        form.classList.add("surveyForm");

        this.questions.forEach((question, index) => {
            form.appendChild(this.createQuestion(question, index));
        });

        const submitButton = document.createElement("input");
        submitButton.type = "submit";
        submitButton.value = "Submit";
        submitButton.classList.add("btn");
        submitButton.classList.add("btn-primary");
        form.appendChild(submitButton);

        const clearButton = document.createElement("input");
        clearButton.type = "button";
        clearButton.value = "Clear";
        clearButton.classList.add("btn");
        clearButton.classList.add("btn-secondary");
        clearButton.addEventListener("click", () => {
            form.reset();
        });
        form.appendChild(clearButton);

        this.container?.appendChild(form);

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const data = this.getAnswers();

            console.table(data); // Do something with the data

            // Send webhook with data
            if (this.options?.webhookUrl) {
                try {
                    const response = await fetch(this.options.webhookUrl, {
                        method: "POST",
                        body: JSON.stringify(data),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    console.log("Webhook response:", await response.json());
                } catch (error) {
                    console.error("Webhook error:", error);
                }
            }
        });

        //Add styles
        console.log(this.options.style);
        if (this.options?.style) {
            this.applyCSS(this.options.style);
        }
    }

    private createQuestion(question: Question, index: number): HTMLElement {
        const fieldset = document.createElement("fieldset");
        const legend = document.createElement("legend");
        legend.textContent = `Question ${index + 1}`;
        fieldset.appendChild(legend);

        const label = document.createElement("label");
        label.classList.add("question-title");
        label.textContent = question.text;
        if (question.required) {
            label.classList.add("required");
        }
        fieldset.appendChild(label);

        switch (question.type) {
            case "text":
            case "email":
            case "tel":
            case "number":
            case "date":
            case "time":
            case "datetime-local":
                const input = this.createInputElement(question, `question-${index}`);
                fieldset.appendChild(input);
                break;

            case "radio":
            case "checkbox":
                question.answers?.forEach((option) => {
                    const input = this.createInputElement(question, `question-${index}`);
                    input.value = option;
                    fieldset.appendChild(input);

                    const optionLabel = document.createElement("label");
                    optionLabel.textContent = option;
                    optionLabel.classList.add("form-check-label");
                    fieldset.appendChild(optionLabel);
                });
                break;

            case "select":
                const select = this.createSelectElement(question, `question-${index}`);
                fieldset.appendChild(select);
                break;

            case "textarea":
                const textarea = this.createTextAreaElement(question, `question-${index}`);
                fieldset.appendChild(textarea);
                break;
        }

        return fieldset;
    }

    private createInputElement(question: Question, name: string): HTMLInputElement {
        const input = document.createElement("input");
        input.type = question.type;
        input.name = name;
        input.classList.add(question.type === "checkbox" || question.type === "radio" ? "form-check-input" : "form-control");

        if (question.required) {
            input.required = true;
        }
        if (question.maxCharacters) {
            input.maxLength = question.maxCharacters;
        }
        if (question.placeholder) {
            input.placeholder = question.placeholder;
        }
        if (question.type === "number") {
            if (question.minValue) {
                input.min = question.minValue.toString();
            }
            if (question.maxValue) {
                input.max = question.maxValue.toString();
            }
            if (question.step) {
                input.step = question.step.toString();
            }
        }
        return input;
    }

    private createSelectElement(question: Question, name: string): HTMLSelectElement {
        const select = document.createElement("select");
        select.name = name;
        select.classList.add("form-control");
        if (question.required) {
            select.required = true;
        }
        if (question.multiple) {
            select.multiple = true;
        }
        question.options?.forEach((option) => {
            const optionElement = document.createElement("option");
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            select.appendChild(optionElement);
        });
        return select;
    }

    private createTextAreaElement(question: Question, name: string): HTMLTextAreaElement {
        const textarea = document.createElement("textarea");
        textarea.name = name;
        textarea.classList.add("form-control");
        if (question.required) {
            textarea.required = true;
        }
        if (question.maxCharacters) {
            textarea.maxLength = question.maxCharacters;
        }
        if (question.placeholder) {
            textarea.placeholder = question.placeholder;
        }
        return textarea;
    }

    private getAnswers() {
        const form = this.container?.querySelector("form") as HTMLFormElement;
        const formData = new FormData(form);

        const data: any = {};
        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                data[key].push(value);
            } else {
                data[key] = [value];
            }
        }

        return data;
    }

    private applyCSS(style: string) {
        const head = document.head || document.getElementsByTagName("head")[0];

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = `../dist/css/${style}.css`;

        head.appendChild(link);
    }
}
