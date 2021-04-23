import express from "express";
import { promises } from "fs";
import {filename, logger} from '../global'
import {AccountType} from '../@types/account'

const router = express.Router();

//Get Accounts
router.get("/", async (_, res) => {
  const data = await promises.readFile(filename, "utf8");
  try {
    const json = JSON.parse(data);
    delete json.nextId;
    logger.info(`GET /account`);
    res.send(json);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//get account by id
router.get("/:id", async (req, res) => {
  //req.params.id;
  try {
    let data = await promises.readFile(filename, "utf8");
    let json = JSON.parse(data);
    const account = json.accounts.find(
      (account: AccountType) => account.id === parseInt(req.params.id, 10)
    );
    logger.info(`GET /account:id - ${JSON.stringify(account)}`);
    res.send(account);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

//Create new account
router.post("/", async (req, res) => {
  let account = req.body;
  try {
    let data = await promises.readFile(filename, "utf8");
    let json = JSON.parse(data);
    account = {
      id: json.nextId,
      ...account,
    };
    json.nextId++;
    json.accounts.push(account);
    await promises.writeFile(filename, JSON.stringify(json));
    res.send("Account saved");
    logger.info(`POST /account - ${JSON.stringify(account)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`POST /account - ${err.message}`);
  }
});

//delete account by id
router.delete("/:id", async (req, res) => {
  try {
    const data = await promises.readFile(filename, "utf8");
    const json = JSON.parse(data);
    const accounts = json.accounts.filter(
      (account: AccountType) => account.id !== parseInt(req.params.id, 10)
    );
    json.accounts = accounts;
    await promises.writeFile(filename, JSON.stringify(json));
    logger.info(`DELETE /account:id - ${JSON.stringify(req.params.id)}`);
    res.end();
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//update account
router.put("/", async (req, res) => {
  try {
    const newAccount = req.body;
    const data = await promises.readFile(filename, "utf8");
    const json = JSON.parse(data);
    const oldIndex = json.accounts.findIndex(
      (account: AccountType) => account.id === newAccount.id
    );
    json.accounts[oldIndex] = newAccount;
    await promises.writeFile(filename, JSON.stringify(json));
    logger.info(`PUT /account - ${JSON.stringify(newAccount)}`);
    res.end();
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

//new transaction /account/transaction
router.put("/transaction", async (req, res) => {
  try {
    let value = req.body;
    console.log(value);
    let index = null;
    let data = await promises.readFile(filename, "utf8");
    
    const json = JSON.parse(data);
    index = json.accounts.findIndex((account: AccountType) => account.id === value.id);
    if (index === -1) throw new Error;
    json.accounts[index].balance += value.balance;
    await promises.writeFile(filename, JSON.stringify(json));
    logger.info(`POST /account - ${JSON.stringify(value)}`);
    res.end();
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

export default router;
