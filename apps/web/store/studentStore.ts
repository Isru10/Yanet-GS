"use client"

import { useState } from "react"

type Subject = { subject_id: number; name: string }
type Grade = { grade_id: number; grade_name: string; level_group: string }

type BrowseFilters = {
  subjectId: number | null
  gradeId: number | null
  dateFrom: string
}

export function useStudentStore() {
  const [browseFilters, setBrowseFilters] = useState<BrowseFilters>({
    subjectId: null,
    gradeId: null,
    dateFrom: "",
  })
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [grades, setGrades] = useState<Grade[]>([])

  const setBrowseFilter = <K extends keyof BrowseFilters>(key: K, value: BrowseFilters[K]) => {
    setBrowseFilters((prev) => ({ ...prev, [key]: value }))
  }
  const resetBrowseFilters = () => setBrowseFilters({ subjectId: null, gradeId: null, dateFrom: "" })

  return {
    browseFilters,
    setBrowseFilter,
    resetBrowseFilters,
    subjects,
    grades,
    setSubjects,
    setGrades,
  }
}
