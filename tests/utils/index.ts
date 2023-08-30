export const getRandomNum = (range: number) => {
  return Math.ceil(Math.random() * range)
}

export const getRandomTitle = () => {
  let title = ''
  for (let i = 0; i < 6; i++) {
    title += getRandomNum(9)
  }
  return title
}
