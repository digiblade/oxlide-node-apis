const { v4: uuid } = require("uuid");
const {
  neo4jResponseToProperty,
  getDataFromToken,
} = require("../Common/Helper/helper");

const getCrmData = async (req, res, session) => {
  try {
    let { label, id } = req.params;
    let filter = id ? `WHERE c.uuid = '${id}' ` : "";
    let query = `MATCH (c:${label}) ${filter}  RETURN c;`;
    const result = await session.run(query);
    res.status(200);
    res.send(neo4jResponseToProperty(result));
  } catch (error) {
    res.status(500);
    res.send({ ...error });
  }
};
const insertCrmData = async (req, res, session) => {
  try {
    let { label } = req.params;
    let { email } = getDataFromToken(req, res);
    let body = {
      uuid: uuid(),
      ...req.body.properties,
      createdAt: new Date().getTime(),
      createdBy: email,
    };
    let edges = req.body.edges ? req.body.edges : [];
    let edgeQuerySet = [];
    let edgeDataSet = {};
    for (let edge in edges) {
      let edgeQuery = `MATCH (e${edge}:Contact {uuid: $id${edge}})
      WHERE e${edge} IS NOT NULL
      CREATE (p)-[:${edges[edge]["relationship"]}]->(e${edge})`;
      edgeDataSet[`id${edge}`] = edges[edge]["id"];
      edgeQuerySet.push(edgeQuery);
    }
    let setOfProperties = [];
    for (let properties in body) {
      setOfProperties.push(`${properties}: $${properties}`);
    }
    let query = `MERGE  (p:${label} {${setOfProperties.join(", ")}}) ${
      edgeQuerySet.length > 0 ? `WITH p ${edgeQuerySet.join("WITH p ")}` : ""
    }  RETURN p;`;
    const result = await session.run(query, { ...body, ...edgeDataSet });
    properties = neo4jResponseToProperty(result, "p");
    res.status(201);
    res.send(properties);
  } catch (error) {
    res.status(500);
    res.send({ ...error });
  }
};
const updateCrmData = async (req, res, session) => {
  try {
    let { label, id } = req.params;
    let { userDetails } = req.user;
    let { email } = getDataFromToken(req, res);
    let body = {
      ...req.body.properties,
      updatedAt: new Date().getTime(),
      modifiedBy: email,
    };
    let edges = req.body.edges ? req.body.edges : [];
    let edgeQuerySet = [];
    let edgeDataSet = {};
    for (let edge in edges) {
      let edgeQuery = `MATCH (e${edge}:Contact {uuid: $id${edge}})
      WHERE e${edge} IS NOT NULL
      ${
        edges[edge]["update"]
          ? `
      OPTIONAL MATCH (p)-[r:${edges[edge]["relationship"]}]->(oldE:${edges[edge]["destination"]})
        DELETE r`
          : ""
      }
      Merge (p)-[:${edges[edge]["relationship"]}]->(e${edge})`;
      edgeDataSet[`id${edge}`] = edges[edge]["id"];
      edgeQuerySet.push(edgeQuery);
    }
    let setOfProperties = [];
    for (let properties in body) {
      setOfProperties.push(`p.${properties} = $${properties}`);
    }
    let query = `MATCH  (p:${label} {uuid : $id}) SET ${setOfProperties.join(
      ", "
    )} ${
      edgeQuerySet.length > 0 ? `WITH p ${edgeQuerySet.join("WITH p ")}` : ""
    } RETURN p;`;
    const result = await session.run(query, { id, ...body, ...edgeDataSet });
    properties = neo4jResponseToProperty(result, "p");

    res.status(200);
    res.send(properties);
  } catch (error) {
    res.status(500);
    res.send({ ...error });
  }
};
module.exports = { getCrmData, insertCrmData, updateCrmData };
