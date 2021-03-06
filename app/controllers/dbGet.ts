import { Request, Response, NextFunction } from "express";

const db = require("../models/dbmodel");

module.exports = {
  dbInformation(req: Request, res: Response, next: NextFunction){
    db.query(`
    SELECT *
    FROM public.containers as c
    JOIN public.pods as p on p.pod_id = c.pod_id
    JOIN public.nodes as n on n.node_id = p.node_id
    ORDER BY c.tm desc;
    `, (err, sqlres) => {
      if (err) return next(err);
      const results = sqlres.rows;
      console.log(results);
      res.locals.dbResults = results;
      return next();
    })
  },
  cleanOutput(req: Request, res: Response, next: NextFunction){
    const { dbResults } = res.locals;
  const cleanedOuput = {};
  dbResults.forEach((info) => {
    const nodeName = info.node_name;
    const containerName = info.container_name;
    const podName = info.pod_name;
    
    const usedMemory = info.used_memory;
    const usedCPU = info.used_cpu;
    const timestamp = info.tm;
    const status = info.status;

    const cpuUsed = info.cpu_used;
    const memoryUsed = info.memory_used;
    const cpuPercent = info.cpu_percent;
    const memoryPercent = info.memory_percent;
    if (!cleanedOuput[timestamp]) {
      cleanedOuput[timestamp] = {};
      cleanedOuput[timestamp][nodeName] = {
        usedCPU,
        usedMemory
      };
      cleanedOuput[timestamp][nodeName].pods = {};
      cleanedOuput[timestamp][nodeName].pods[podName] = {
        status,
        containers: {}
      }
      cleanedOuput[timestamp][nodeName].pods[podName].containers[containerName] = {
        cpuUsed,
        memoryUsed,
        cpuPercent,
        memoryPercent
      };
    }
    else {
      if (!cleanedOuput[timestamp][nodeName].pods[podName]) {
        cleanedOuput[timestamp][nodeName].pods[podName] = {};
        cleanedOuput[timestamp][nodeName].pods[podName].containers = {};
      }
      cleanedOuput[timestamp][nodeName].pods[podName].containers[containerName] = {
        cpuUsed,
        memoryUsed,
        cpuPercent,
        memoryPercent
      }
    }
  })
  res.locals.cleanedOuput = cleanedOuput;
  return next();
  }
}