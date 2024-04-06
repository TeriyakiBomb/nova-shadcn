const FRAMEWORK = "shadcn.framework";
const SHELL_PATH_KEY = "shadcn.shell.path";

const shadComponents = [
  "accordion",
  "alert",
  "alert-dialog",
  "aspect-ratio",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "calendar",
  "card",
  "carousel",
  "checkbox",
  "collapsible",
  "command",
  "context-menu",
  "dialog",
  "drawer",
  "dropdown-menu",
  "form",
  "hover-card",
  "input",
  "label",
  "menubar",
  "navigation-menu",
  "pagination",
  "pin-input",
  "popover",
  "progress",
  "radio-group",
  "resizable",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "skeleton",
  "slider",
  "sonner",
  "switch",
  "table",
  "tabs",
  "tags-input",
  "textarea",
  "toast",
  "toggle",
  "toggle-group",
  "tooltip",
];

function getShadcnComponent(command, successMessage) {
  executeCommand(command, successMessage);
}

nova.commands.register("shadcn.installComponent", (workspace) => {
  function configToPublish(component) {
    const commandName = `add ${component}`;
    getShadcnComponent(commandName, `Installed ${component}`);
  }

  nova.workspace.showChoicePalette(shadComponents, {}, configToPublish);
});

function executeCommand(command, successMessage) {
  const framework = nova.config.get(FRAMEWORK);

  let packageIdentifier;
  switch (framework) {
    case "React":
      packageIdentifier = "shadcn-ui";
      break;
    case "Vue":
      packageIdentifier = "shadcn-vue";
      break;
    case "Svelte":
      packageIdentifier = "shadcn-svelte";
      break;
    default:
      console.error("Unsupported framework");
      return;
  }

  const fullCommand = `npx ${packageIdentifier}@latest ${command}`;

  const options = {
    args: ["-c", fullCommand],
    shell: true,
    cwd: nova.workspace.path,
  };
  const shell = nova.config.get(SHELL_PATH_KEY);
  const process = new Process(shell, options);
  let processError = false;
  let stdoutOutput = "";

  process.onStdout((data) => {
    if (data.includes("ERROR")) {
      console.error("Process finished with errors");
      nova.workspace.showErrorMessage(`⚠️ ${data.trim()}`);
      processError = true;
      return;
    }

    console.log(`🏃‍♀️ Running ${fullCommand}`);
    stdoutOutput += data.trim() + "\n";
  });

  process.onStderr((data) => {
    console.error(`⚠️ Error: ${data.trim()}`);
  });

  process.onDidExit((status) => {
    console.log(`👍 Process exited with status: ${status}`);

    if (status === 0 && !processError) {
      showNotification(successMessage, fullCommand);
    } else if (status !== 0) {
      console.error(`⚠️ Process finished with non-zero status - ${status}`);
    }
  });

  process.start();
}

function showNotification(title, body) {
  const notification = new NotificationRequest("shadcn-notification");

  notification.title = title;
  notification.body = body;

  nova.notifications.add(notification);
}
