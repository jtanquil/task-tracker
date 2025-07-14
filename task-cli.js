"use strict";

const fs = require('fs/promises');

const COMMANDS = ["add", "update", "delete", "mark-in-progress", "mark-done", "list"];
const LIST_FILTERS = ["done", "todo", "in-progress"];
const HELP_STRING = `task-cli usage:
task-cli.js [add/update/delete/mark-in-progress/mark-done/list]
add: task-cli.js add "task_description"
update: task-cli.js update task_id "task_description"
delete: task-cli.js delete task_id
mark-in-progress: task-cli.js mark-in-progress task_id
mark-done: task-cli.js mark-done task_id
list: task-cli.js list [done/todo/in-progress]`;
const FILENAME = "tasks.json";
const FILE_INIT = `{
  "currentId": 0,
  "tasks": []
}`;

function createTask(id, taskDescription) {
  return {
    id: id,
    description: taskDescription,
    status: "todo",
    createdAt: new Date,
    updatedAt: new Date,
  }
}

async function addTask(taskDescription, fileName = FILENAME) {
  try {
    await fs.access(fileName)
      .catch(() => {
        console.error(`${fileName} doesn't exist, creating ${fileName}`);
        
        fs.appendFile(fileName, FILE_INIT, { flag : 'w' });
      });

      const data = JSON.parse(await fs.readFile(fileName));
      data.currentId += 1;
      data.tasks.push(createTask(data.currentId, taskDescription));
      await fs.writeFile(fileName, JSON.stringify(data));
      
      console.log(`Task added successfully (ID: ${data.currentId})`);
  } catch (error) {
    console.error(`Error while opening ${fileName}: ${error}`);
  }
}

async function updateTask(taskId, taskDescription, fileName = FILENAME) {
  try {
    console.log("test");
  } catch (error) {
    console.error(`Error while opening ${fileName}: ${error}`);
  }
}

async function listTasks(listFilter, fileName = FILENAME) {
  try {
    const data = JSON.parse(await fs.readFile(fileName));
    
    for (let i = 0; i < data.tasks.length; i++) {
      console.log(`id: ${data.tasks[i].id}`);
      console.log(`description: ${data.tasks[i].description}`);
      console.log(`status: ${data.tasks[i].status}`);
      console.log(`createdAt: ${data.tasks[i].createdAt}`);
      console.log(`updatedAt: ${data.tasks[i].updatedAt}\n`);
    }
  } catch (error) {
    console.error(`Error while opening ${fileName} : ${error}`);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

// Create json if it doesn't exist
// Open json
// Write/read as needed
if (args.length == 0) {
  console.log(HELP_STRING);
} else {
  switch(args[0]) {
    case "add":
      if (args.length == 1) {
        console.log(`Usage: task-cli.js add "task_description"`);
      } else {
        addTask(args[1]);
      }

      break;
    case "update":
      if (args.length < 3 || Number.isNaN(args[1])) {
        console.log(`Usage: task_cli.js update task_id "task_description"`);
      } else {
        updateTask(args[1], args[2]);
      }

      break;
    case "delete":
      // validate input
      // if valid, open the file and remove the id
      break;
    case "mark-in-progress":
      // validate input
      // if valid, open the file and modify the id
      break;
    case "mark-done":
      // validate input
      // if valid, open the file and modify the id
      break;
    case "list":
      const listFilter = (args.length == 1) ? "" : args[1];
      listTasks(listFilter);

      break;
    default:
      console.log(`Usage error: invalid command; valid commands are [${COMMANDS.join(", ")}]`);
  }
}