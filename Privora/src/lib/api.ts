const API_BASE = "http://127.0.0.1:8000"

// Auth
export const signup = async (data: any) => {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return res.json()
}

export const login = async (data: any) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return res.json()
}

// Agents
export const createAgent = async (data: any) => {
  const res = await fetch(`${API_BASE}/agents/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return res.json()
}

export const getAgents = async () => {
  const res = await fetch(`${API_BASE}/agents`)
  return res.json()
}

export const getAgent = async (id: string) => {
  const res = await fetch(`${API_BASE}/agents/${id}`)
  return res.json()
}

// Execute


// Privacy
export const getPrivacy = async (id: string) => {
  const res = await fetch(`${API_BASE}/agents/privacy/${id}`)
  return res.json()
}

// Audit
export const getExecutions = async (id: string) => {
  const res = await fetch(`${API_BASE}/agents/executions/${id}`)
  return res.json()
}

// Analytics
export const getAnalytics = async () => {
  const res = await fetch(`${API_BASE}/agents/analytics/dashboard`)
  return res.json()
}

export const deleteAgent = async (id: string) => {
  const res = await fetch(`${API_BASE}/agents/${id}`, {
    method: "DELETE",
  })
  return res.json()
}

export const runAgent = async (id: string, file: File) => {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch(`${API_BASE}/agents/execute/${id}`, {
    method: "POST",
    body: formData
  })

  return res.json()
}

export const downloadResult = (id: string, format: string) => {
  window.open(
    `${API_BASE}/agents/download/${id}/${format}`
  )
}