"use strict";

const fs = require('fs');

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

function addTask(taskDescription, fileName = FILENAME) {
  try {
    if (!fs.existsSync(fileName)) {
        console.error(`${fileName} doesn't exist, creating ${fileName}`);
        
        fs.appendFileSync(fileName, FILE_INIT, { flag : 'w' });
    }

    const data = JSON.parse(fs.readFileSync(fileName));
    data.currentId += 1;
    data.tasks.push(createTask(data.currentId, taskDescription));
    fs.writeFileSync(fileName, JSON.stringify(data));

    console.log(`Task added successfully (ID: ${data.currentId})`);
  } catch (error) {
    console.error(`Error while opening ${fileName}: ${error}`);
  }
}

function updateTask(taskId, taskDescription, fileName = FILENAME) {
  try {
    const data = JSON.parse(fs.readFileSync(fileName));
    const task = data.tasks.find(task => task.id === Number(taskId));

    if (!task) {
      throw new Error(`taskId ${taskId} not found`);
    } else {
      task.description = taskDescription;
      task.updatedAt = new Date;
      fs.writeFileSync(fileName, JSON.stringify(data));

      console.log(`Task successfully updated (ID: ${taskId}, description: ${taskDescription})`);
    }
  } catch (error) {
    console.error(`Error while opening ${fileName}: ${error}`);
  }
}

function deleteTask(taskId, fileName = FILENAME) {
  try {
    const data = JSON.parse(fs.readFileSync(fileName));
    
    if (!data.tasks.some(task => task.id == taskId)) {
      throw new Error(`taskId ${taskId} not found`);
    } else {
      data.tasks = data.tasks.filter(task => task.id != taskId);
      fs.writeFileSync(fileName, JSON.stringify(data));

      console.log(`Task with ID ${taskId} successfully deleted`);
    }
  } catch (error) {
    console.error(`Error while opening ${fileName}: ${error}`);
  }
}

function markTask(taskId, taskStatus, fileName = FILENAME) {
  try {
    const data = JSON.parse(fs.readFileSync(fileName));
    const task = data.tasks.find(task => task.id === Number(taskId));

    if (!task) {
      throw new Error(`taskId ${taskId} not found`);
    } else {
      task.status = taskStatus;
      task.updatedAt = new Date;
      fs.writeFileSync(fileName, JSON.stringify(data));

      console.log(`Task status successfully updated (ID: ${taskId}, status: ${taskStatus})`);
    }
  } catch (error) {
    console.error(`Error while opening ${fileName}: ${error}`);
  }
}

function listTasks(listFilter, fileName = FILENAME) {
  try {
    const data = JSON.parse(fs.readFileSync(fileName));
    const tasks = (listFilter) ? data.tasks.filter(task => task.status === listFilter) : data.tasks;
    
    for (let i = 0; i < tasks.length; i++) {
      console.log(`id: ${tasks[i].id}`);
      console.log(`description: ${tasks[i].description}`);
      console.log(`status: ${tasks[i].status}`);
      console.log(`createdAt: ${tasks[i].createdAt}`);
      console.log(`updatedAt: ${tasks[i].updatedAt}\n`);
    }
  } catch (error) {
    console.error(`Error while opening ${fileName} : ${error}`);
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
        console.log(`Usage: task-cli.js add "task_description"`);
      } else {
        addTask(args[1]);
      }

      break;
    case "update":
      if (args.length < 3) {
        console.log(`Usage: task_cli.js update task_id "task_description"`);
      } else {
        updateTask(args[1], args[2]);
      }

      break;
    case "delete":
      if (args.length < 2) {
        console.log(`Usage: task_cli.js delete task_id`);
      } else {
        deleteTask(args[1]);
      }

      break;
    case "mark-in-progress":
      if (args.length < 2) {
        console.log(`Usage: task_cli.js mark-in-progress task_id`);
      } else {
        markTask(args[1], 'in-progress');
      }

      break;
    case "mark-done":
      if (args.length < 2) {
        console.log(`Usage: task_cli.js mark-done task_id`);
      } else {
        markTask(args[1], 'done');
      }

      break;
    case "list":
      const listFilter = (args.length == 1) ? "" : args[1];

      if (args.length > 1 && !LIST_FILTERS.some(filter => filter === listFilter)) {
        console.log(`Usage: task-cli.js list [done/todo/in-progress]`);
      } else {
        listTasks(listFilter);
      }

      break;
    default:
      console.log(`Usage error: invalid command; valid commands are [${COMMANDS.join(", ")}]`);
  }
}