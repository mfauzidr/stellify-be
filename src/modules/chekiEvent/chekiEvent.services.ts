import db from "../../shared/config/pg";
import { IChekiEventBody, IUpdateChekiEventBody } from "./chekiEvent.model";
import * as eventsRepo from "../events/events.repo";
import * as chekiPackagesRepo from "../cheki/cheki.repo";
import * as eventMembersRepo from "../events/event_members/event_members.repo";
import { AppError } from "src/shared/helper/appError";

export const findChekiEvent = async (uuid: string) => {
  const client = await db.connect();

  try {
    const [event] = await eventsRepo.findByUuid(uuid, client);

    if (!event) {
      throw new AppError("EVENT_NOT_FOUND", "Event not found", 404);
    }

    const packages = await chekiPackagesRepo.findByEventUuid(uuid, client);

    return {
      event,
      packages,
    };
  } finally {
    client.release();
  }
};

export const createChekiEventService = async (
  body: IChekiEventBody,
): Promise<unknown> => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const [event] = await eventsRepo.insert(body.event, client);

    await eventMembersRepo.insertEventMembers(
      event.uuid,
      body.member_uuids,
      client,
    );

    const packages = [];

    for (const pkg of body.packages) {
      const [insertedPackage] = await chekiPackagesRepo.insert(
        {
          ...pkg,
          event_uuid: event.uuid,
        },
        client,
      );

      packages.push(insertedPackage);
    }

    await client.query("COMMIT");

    return {
      event,
      packages,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateChekiEventService = async (
  uuid: string,
  body: IUpdateChekiEventBody,
) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const [existingEvent] = await eventsRepo.findByUuid(uuid, client);

    if (!existingEvent) {
      throw new AppError("EVENT_NOT_FOUND", "Event not found", 404);
    }

    let event = existingEvent;

    if (body.event) {
      const [updatedEvent] = await eventsRepo.update(uuid, body.event, client);

      event = updatedEvent;
    }

    if (body.member_uuids) {
      if (body.member_uuids.length === 0) {
        throw new AppError(
          "NO_MEMBER",
          "Please select at least one member",
          400,
        );
      }

      const uniqueMembers = new Set(body.member_uuids);

      if (uniqueMembers.size !== body.member_uuids.length) {
        throw new AppError(
          "DUPLICATE_MEMBER",
          "Duplicate member selected",
          400,
        );
      }

      await eventMembersRepo.deleteEventMembers(uuid, client);

      await eventMembersRepo.insertEventMembers(
        uuid,
        body.member_uuids,
        client,
      );
    }

    let packages = [];

    if (body.packages) {
      const existingPackages = await chekiPackagesRepo.findByEventUuid(
        uuid,
        client,
      );

      for (const data of body.packages) {
        if (!data) continue;

        if (data.uuid) {
          const existingPackage = existingPackages.find(
            (item) => item.uuid === data.uuid,
          );

          if (!existingPackage) {
            throw new AppError(
              "PACKAGE_NOT_FOUND",
              "Cheki package not found in this event",
              404,
            );
          }

          const [updatedPackage] = await chekiPackagesRepo.update(
            data.uuid,
            data,
            client,
          );

          packages.push(updatedPackage);
          continue;
        }

        const [insertedNewPackage] = await chekiPackagesRepo.insert(
          {
            ...data,
            event_uuid: uuid,
          },
          client,
        );
        packages.push(insertedNewPackage);
      }
    }

    await client.query("COMMIT");

    return {
      event,
      packages,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
