import { workerData, parentPort } from 'worker_threads';

parentPort?.postMessage({ value : (workerData.message as string) + " effect of worker!"});
