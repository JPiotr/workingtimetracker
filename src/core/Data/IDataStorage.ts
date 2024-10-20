export interface IDataStorage {
    loadData(): Promise<void>;
    saveData() : Promise<void>;
}
