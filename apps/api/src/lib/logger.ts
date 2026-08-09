type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const write = (level: LogLevel, message: string, meta?: unknown) => {
    const entry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...(meta !== undefined ? { meta } : {}),
    };
    const line = JSON.stringify(entry);

    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
};

export const logger = {
    info: (message: string, meta?: unknown) => write('info', message, meta),
    warn: (message: string, meta?: unknown) => write('warn', message, meta),
    error: (message: string, meta?: unknown) => write('error', message, meta),
    debug: (message: string, meta?: unknown) => {
        if (process.env.NODE_ENV !== 'production') write('debug', message, meta);
    },
};
