const MAX_VALUE_HEX = 16777215 // corresponds to FFFFFF

 // convert the number to hexadecimal, and then pad with 0's if needed to ensure a color hex
const toColorHex = (number: number) => {
    return number.toString(16).padStart(6, '0')
}

const generateHexColor = (id: number) => {    
    const seed = id % MAX_VALUE_HEX
    return `#${toColorHex(seed)}`
}

export default generateHexColor
