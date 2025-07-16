"use strict";

const fs = require('fs');

const COMMANDS = ["add", "update", "delete", "mark-in-progress", "mark-done", "list"];
const LIST_FILTERS = ["done", "todo", "in-progress"];
const HELP_STRING = `task-cli usage:
task-cli [add/update/delete/mark-in-progress/mark-done/list]
add: task-cli add "task_description"
update: task-cli update task_id "task_description"
delete: task-cli.js delete task_id
mark-in-progress: task-cli mark-in-progress task_id
mark-done: task-cli mark-done task_id
list: task-cli list [done/todo/in-progress]`;
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

function openTasks(callback, args) {
  try {
    if (!fs.existsSync(FILENAME)) {
      console.error(`${FILENAME} doesn't exist, creating ${FILENAME}`);

      fs.appendFileSync(FILENAME, FILE_INIT, { flag: 'w' });
    }

    callback(args);
  } catch (error) {
    console.error(`Error while opening ${FILENAME}: ${error}`);
  }
}

function addTask(taskDescription) {
  const data = JSON.parse(fs.readFileSync(FILENAME));
  data.currentId += 1;
  data.tasks.push(createTask(data.currentId, taskDescription));
  fs.writeFileSync(FILENAME, JSON.stringify(data));

  console.log(`Task added successfully (ID: ${data.currentId})`);
}

function updateTask(taskProperties) {
  const data = JSON.parse(fs.readFileSync(FILENAME));
  const task = data.tasks.find(task => task.id === Number(taskProperties.id));

  if (!task) {
    throw new Error(`taskId ${taskProperties.id} not found`);
  } else {
    for (let property in taskProperties) {
      if (property != "id") {
        task[property] = taskProperties[property];
      }
    }
    task.updatedAt = new Date;
    fs.writeFileSync(FILENAME, JSON.stringify(data));

    console.log(`Task successfully updated (ID: ${taskProperties.id})`);
  }
}

function deleteTask(taskId) {
  const data = JSON.parse(fs.readFileSync(FILENAME));
  
  if (!data.tasks.some(task => task.id == taskId)) {
    throw new Error(`taskId ${taskId} not found`);
  } else {
    data.tasks = data.tasks.filter(task => task.id != taskId);
    fs.writeFileSync(FILENAME, JSON.stringify(data));

    console.log(`Task successfully deleted (ID: ${taskId})`);
  }
}

function listTasks(listFilter) {
  const data = JSON.parse(fs.readFileSync(FILENAME));
  const tasks = (listFilter) ? data.tasks.filter(task => task.status === listFilter) : data.tasks;
  
  for (let i = 0; i < tasks.length; i++) {
    console.log(`id: ${tasks[i].id}`);
    console.log(`description: ${tasks[i].description}`);
    console.log(`status: ${tasks[i].status}`);
    console.log(`createdAt: ${tasks[i].createdAt}`);
    console.log(`updatedAt: ${tasks[i].updatedAt}\n`);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length == 0) {
  console.log(HELP_STRING);
} else {
  switch(args[0]) {
    case "add":
      if (args.length == 1) {
        console.log(`Usage: task-cli add "task_description"`);
      } else {
        openTasks(addTask, args[1]);
      }

      break;
    case "update":
      if (args.length < 3) {
        console.log(`Usage: task_cli update task_id "task_description"`);
      } else {
        openTasks(updateTask, { id: args[1],  description: args[2] });
      }

      break;
    case "delete":
      if (args.length < 2) {
        console.log(`Usage: task_cli delete task_id`);
      } else {
        openTasks(deleteTask, args[1]);
      }

      break;
    case "mark-in-progress":
      if (args.length < 2) {
        console.log(`Usage: task_cli mark-in-progress task_id`);
      } else {
        openTasks(updateTask, { id: args[1], status: 'in-progress' });
      }

      break;
    case "mark-done":
      if (args.length < 2) {
        console.log(`Usage: task_cli mark-done task_id`);
      } else {
        openTasks(updateTask, { id: args[1], status: 'done' });
      }

      break;
    case "list":
      const listFilter = (args.length == 1) ? "" : args[1];

      if (args.length > 1 && !LIST_FILTERS.some(filter => filter === listFilter)) {
        console.log(`Usage: task-cli list [done/todo/in-progress]`);
      } else {
        openTasks(listTasks, listFilter);
      }

      break;
    default:
      console.log(`Usage error: invalid command; valid commands are [${COMMANDS.join(", ")}]`);
  }
}