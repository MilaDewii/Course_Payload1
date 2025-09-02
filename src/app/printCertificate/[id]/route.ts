import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import ejs from 'ejs'
import axios from 'axios'
import { Course, Participation } from '@/payload-types'
import { getUser } from '@/app/(app)/(authenticated)/actions/getUser'

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const user = await getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id: participationId } = params

    // 🔹 Force cast hasil findByID ke Participation
    const participation = (await payload.findByID({
      collection: 'participation',
      id: participationId,
      overrideAccess: false,
      user: user,
    })) as unknown as Participation

    if (!participation) {
      return new NextResponse('Participation not found', { status: 404 })
    }

    const course = participation.course as Course
    const curriculum = course.curriculum

    if (!curriculum || curriculum.length === 0) {
      return new NextResponse('Curriculum not found', { status: 400 })
    }

    const lastModule = curriculum[curriculum.length - 1]

    if (!lastModule || lastModule.blockType !== 'finish') {
      return new NextResponse('Course has no certificate', { status: 400 })
    }

    if (participation.progress !== curriculum.length - 1) {
      return new NextResponse('Course not finished', { status: 400 })
    }

    if (!('template' in lastModule) || !lastModule.template) {
      return new NextResponse('Template not found', { status: 400 })
    }

    // 🔹 Render template pakai ejs
    const html = ejs.render(lastModule.template, {
      name: user.email ?? 'Anonymous',
      courseTitle: course.title,
      date: new Date(participation.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      issuer: 'Politeknik Negeri Semarang',
    })

    // 🔹 Panggil Api2Pdf
    const api2pdfResponse = await axios.post(
      'https://v2.api2pdf.com/chrome/pdf/html',
      {
        html: html,
        inlinePdf: false,
        fileName: `${course.title}.pdf`,
      },
      {
        headers: {
          Authorization: process.env.API2PDF_KEY as string,
          'Content-Type': 'application/json',
        },
      },
    )

    const fileUrl = api2pdfResponse.data.FileUrl
    if (!fileUrl) {
      return new NextResponse('Failed to generate PDF', { status: 500 })
    }

    // 🔹 Download PDF dari Api2Pdf
    const pdfResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' })

    return new NextResponse(pdfResponse.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Certificate-${course.title}.pdf"`,
      },
    })
  } catch (err) {
    console.error('Certificate error:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
