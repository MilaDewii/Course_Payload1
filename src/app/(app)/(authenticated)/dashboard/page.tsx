'use server'

import { getPayload } from 'payload'
import React, { Suspense } from 'react'
import configPromise from '@payload-config'
import Image from 'next/image'
import { Course, Participation } from '@/payload-types'
import Link from 'next/link'
import { getUser } from '../actions/getUser'
import ResumeButton from './course/[courseId]/components/ResumeButton'

const Page = async () => {
  const payload = await getPayload({ config: configPromise })

  // get the user
  const user = await getUser()

  let courses: Course[] = []
  let participations: Participation[] = [] // ✅ definisikan dulu

  try {
    // Ambil courses
    const coursesRes = await payload.find({
      collection: 'courses',
      limit: 10,
      overrideAccess: false,
      user: user,
    })
    courses = coursesRes.docs

    // Ambil participations
    const participationsRes = await payload.find({
      collection: 'participation', // pastikan nama koleksi sesuai
      limit: 10,
      overrideAccess: false,
      user: user,
    })
    participations = participationsRes.docs
  } catch (e) {
    console.error('Error fetching data:', e)
  }

  return (
    <>
      <div className="flex flex-col mx-auto w-full max-w-4xl p-4 gap-4">
        <div className="text-xl">
          Welcome <span className="text-gray-400">{user?.email}</span>
        </div>
        {participations && participations.length > 0 && (
          <div className="text-sm text-teal-400">Your Courses</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Suspense fallback={<div>Loading...</div>}>
            {participations.map((participation) => (
              <ResumeButton
                key={participation.id}
                participation={participation}
              />
            ))}
          </Suspense>
        </div>
      </div>

      <div className="flex flex-col mx-auto w-full max-w-4xl p-4 gap-4">
        <div className="text-xl">
          Welcome <span className="text-gray-400">{user?.email}</span>
        </div>
        <div className="text-sm text-teal-400">All Courses</div>
        <div className="grid grid-cols-2 gap-4">
          <Suspense fallback={<div>Loading...</div>}>
            {courses.map((course) => {
              const imageUrl =
                typeof course.image === 'string'
                  ? '/placeholder.jpg'
                  : course.image?.url || '/placeholder.jpg'

              return (
                <Link
                  href={`/dashboard/course/${course.id}`}
                  key={course.id}
                  className="flex flex-col cursor-pointer relative border border-gray-700 hover:border-white transition ease-in-out duration-100 overflow-hidden"
                >
                  <div className="relative w-full aspect-video">
                    <Image
                      alt={`${course.title ?? 'Course'} thumbnail`}
                      src={imageUrl}
                      fill
                    />
                  </div>
                </Link>
              )
            })}
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default Page
