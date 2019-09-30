// const math = require('../src/math')
const {add, calculateTip, 
    fahrenheitToCelsius, celsiusToFahrenheit} = require('../src/math')

// test('Hello Test!', () => { 
// }) 
// test('This should fail', () => {
//     throw new Error('Failure!')
// })

test('Should calculate total with tip', () => {
    const total = calculateTip(10, .3)
    // if (total !== 13) {
    //     throw new Error('Total tip should be 13. Got ' + total)
    // }
    expect(total).toBe(13)
})

test('Should calculate total with default tip', () => {
    const total = calculateTip(10)
    expect(total).toBe(12.5)
})

test('Should convert 32 F to 0 C', () => {
    const celsius = fahrenheitToCelsius(32)
    expect(celsius).toBe(0)
})

test('Should convert 0 C to 32 F', () => {
    const fahrenheit = celsiusToFahrenheit(0)
    expect(fahrenheit).toBe(32)
})

// test('Async test demo', (done) => {
//     setTimeout(() => { 
//         expect(1).toBe(2)
//         done()
//     }, 2000)
// })

test('Should add two numbers', (done) => { 
    add(2, 3).then((sum) => { 
        expect(sum).toBe(5)
        done()
    })
})

test('Should add two numbers async/await', async () => { 
    const sum = await add(10, 22)
    expect(sum).toBe(32)
})