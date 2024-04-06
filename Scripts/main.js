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

  let fullCommand;
  switch (framework) {
    case "React":
      fullCommand = "npx shadcn-ui@latest " + command;
      break;
    case "Vue":
      fullCommand = "npx shadcn-vue@latest " + command;
      break;
    case "Svelte":
      fullCommand = "npx shadcn-svelte@latest " + command;
      break;
    default:
      console.error("Unsupported framework");
      return;
  }

  let options = {
    args: ["-c", fullCommand],
    shell: true,
    cwd: nova.workspace.path,
  };
  const shell = nova.config.get(SHELL_PATH_KEY);
  let process = new Process(shell, options);
  let processError = false;
  let stdOutRunCount = 0;
  let stdoutOutput = "";

  process.onStdout((data) => {
    if (data.includes("ERROR")) {
      console.error("Process finished with errors");
      nova.workspace.showErrorMessage(`⚠️ ${data.trim()}`);
      processError = true;
      return;
    } else if (stdOutRunCount === 0) {
      console.log(`🏃‍♀️ Running ${fullCommand}`);
      stdOutRunCount++;
    }

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
  let notification = new NotificationRequest("LaravelArtisan-notification");

  notification.title = title;
  notification.body = body;

  nova.notifications.add(notification);
}
