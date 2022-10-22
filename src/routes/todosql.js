const express = require('express');
const router = express.Router();
const { Pool, Client } = require('pg');
const uuidv4 = require('uuid');

const credentials = {
  user:       "test2-main-db-0c1958f0d431bbd8c",
  host:       "user-prod-us-east-2-1.cluster-cfi5vnucvv3w.us-east-2.rds.amazonaws.com",
  database:   "test2-main-db-0c1958f0d431bbd8c",
  password:   "9tKhtQzvwvQpNxREgv5UBYzamnpvZZ",
  port:       "5432",
};

router.get("/", async (req, res) => {
    const pool = new Pool(credentials);
    const results = await getPosts(pool);
    res.json(results.rows)
    await pool.end();

});

router.get("/get-user-dex", async (req, res) => {
  const username = req.query.username
  const pool = new Pool(credentials);
  const results = await getUserDex(username, pool);
  res.json(results.rows)
  await pool.end();

})

router.put("/update-dex", async (req, res) => {
  const pool = new Pool(credentials);
  const results = await updateUserDex(req.body, pool);
  res.json(results.rows)
  await pool.end();

})


async function getPosts(pool) {
  const text = `
    SELECT
        *
    FROM public.pokemon AS p
  `;
  return pool.query(text);
}

async function getUserDex(username, pool) {
  const text = `
    SELECT 
      p."dexnum" as ndex, 
      p."name" as name,
      coalesce(pm."caught", false) as caught, 
      coalesce(pm."shiny", false) as shiny  
    FROM public.pokemon p
    LEFT OUTER JOIN user_pokemon_mapping as pm
      ON p."dexnum" = pm."pokemonId" and pm.username = $1
    ORDER BY 
      p.dexnum asc
  `;
  const values = [username]
  return pool.query(text, values);
}

async function updateUserDex(data, pool) {
  const text = `
    INSERT INTO user_pokemon_mapping("_id", "pokemonId", "username", "caught", "shiny")
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT ("pokemonId", "username")
    DO 
      UPDATE SET 
      "_id"     = excluded."_id",
      "caught"  = excluded."caught",
      "shiny"   = excluded."shiny"
    RETURNING *
  `;
  const values = [
    uuidv4.v4(),
    data.pokemonId,
    data.username,
    data.caught,
    data.shiny
  ]
  return pool.query(text, values);
}

module.exports = router;