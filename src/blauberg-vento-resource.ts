import { CrudRepository, Page, PageRequest } from "@apaq/leap-data-core";
import { Controller } from "./controller";

export class BlaubergVentoResource implements CrudRepository<Controller, string>{
    findAll(pageable?: PageRequest): Promise<Page<Controller>> {
        throw new Error("Method not implemented.");
    }
    findById(id: string): Promise<Controller> {
        throw new Error("Method not implemented.");
    }
    save(entity: Controller): Promise<Controller> {
        throw new Error("Method not implemented.");
    }
    saveAll(entities: Controller[]): Promise<Controller[]> {
        throw new Error("Method not implemented.");
    }

    deleteById(id: string): Promise<void> {
        throw new Error("Devices cannot be deleted.");
    }

    deleteAllById(ids: string[]): Promise<void> {
        throw new Error("Devices cannot be deleted.");
    }

    delete(entity: Controller): Promise<void> {
        throw new Error("Devices cannot be deleted.");
    }

    deleteAll(entities: Controller[]): Promise<void> {
        throw new Error("Devices cannot be deleted.");
    }

}