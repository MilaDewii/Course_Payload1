import { getPayload } from "payload";
import configPromise from "@payload-config";
import { getUser } from "../../../actions/getUser";
import { Participation } from "@/payload-types";
import { notFound } from "next/navigation";
import { HiArrowLeft } from "react-icons/hi";
import Link from "next/link";
import CourseViewer from "./components/CourseViewer"; // Assuming you have a CourseViewer component to display the course content

export default async function ParticipationPage({
  params,
}: {
  params: { participationId: string };
}) {
  const payload = await getPayload({ config: configPromise });

  const user = await getUser();

  const { participationId } = params;

  let participation: Participation | null = null;
  try {
    const res = await payload.findByID({
      collection: "participation",
      id: participationId,
      overrideAccess: false,
      user: user,
    });

    participation = res;
  } catch (err) {
    console.error(err);
    return notFound();
  }

  if (!participation) {
    return notFound();
  }

  return (
    <div className="flex flex-col mx-auto w-full max-w-4xl p-4 gap-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition duration-300 ease-in-out"
      >
        <HiArrowLeft className="text-lg" />
        Back to Dashboard
      </Link>

      <CourseViewer participation={participation} />
    </div>
  );
}
