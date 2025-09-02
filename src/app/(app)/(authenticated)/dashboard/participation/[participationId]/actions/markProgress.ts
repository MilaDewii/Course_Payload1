"use server";

import { Participation } from "@/payload-types";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { getUser } from "@/app/(app)/(authenticated)/actions/getUser";

export async function markProgress(participation: Participation) {
  const payload = await getPayload({ config: configPromise });
  const user = await getUser();

  if (!participation) {
    console.error("Invalid participation data");
    return null;
  }

  const nextProgress = (participation.progress ?? 0) + 1;

  try {
    const updateRes = await payload.update({
      collection: "participation",
      id: participation.id,
      data: {
        progress: nextProgress,
      },
      user: user,
    });

    return updateRes;
  } catch (error) {
    console.error("Error updating participation progress:", error);
    return null;
  }
}
