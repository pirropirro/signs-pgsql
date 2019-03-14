export interface IPGClient {
    process<T>(query: { text: string; values?: any[] }): Promise<T[]>;
}
