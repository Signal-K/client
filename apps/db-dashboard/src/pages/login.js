import { getPbUrl, pb, setPbUrl, signIn } from "../pb.js";
import { h, icon } from "../ui.js";

export function loginPage(onSuccess) {
    const error = h("div", { class: "alert danger", hidden: true });
    const email = h("input", { type: "email", required: true, autocomplete: "username", autofocus: true });
    const password = h("input", { type: "password", required: true, autocomplete: "current-password" });
    const url = h("input", { type: "url", value: getPbUrl() });
    const btn = h("button", { type: "submit", class: "btn lg block" }, h("span", { class: "txt" }, "Login"), icon("ri-arrow-right-line"));

    const form = h("form", {
        class: "login-card",
        onsubmit: async (e) => {
            e.preventDefault();
            btn.disabled = true;
            btn.classList.add("loading");
            error.hidden = true;
            try {
                setPbUrl(url.value);
                pb.baseURL = getPbUrl();
                await signIn(email.value, password.value);
                onSuccess();
            } catch (err) {
                error.hidden = false;
                error.textContent = err?.status === 400
                    ? "Invalid email or password."
                    : `Could not reach the server (${err?.message || "error"}). It may be waking up, try again.`;
            } finally {
                btn.disabled = false;
                btn.classList.remove("loading");
            }
        },
    },
        h("img", { src: "/images/logo.svg", alt: "Star Sailors", class: "login-logo" }),
        h("h4", { class: "txt-center m-b-base" }, "Superuser login"),
        error,
        h("div", { class: "field m-b-sm" }, h("label", null, "Email"), email),
        h("div", { class: "field m-b-sm" }, h("label", null, "Password"), password),
        h("details", { class: "m-b-base" },
            h("summary", { class: "txt-hint txt-sm" }, "Server"),
            h("div", { class: "field m-t-sm" }, url)),
        btn,
    );

    return h("div", { class: "login-wrap" }, form);
}
