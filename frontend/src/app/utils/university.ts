export const university = [
  'Select University',
  'University of New South Wales',
  'University of Sydney',
  'University of Technology Sydney',
  'Macquarie University',
]

export const nameToId = (name: string) => {
  return university.indexOf(name);
}