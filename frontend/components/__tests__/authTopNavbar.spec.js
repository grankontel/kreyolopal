import React from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { useZakari } from '../ZakProvider'
import TopNavbar from '../TopNavbar'

const mockUseZakari = jest.fn(() => {
  return {
    user: {
      id: 1,
      firstname: 'Thierry',
      lastname: 'Malo',
      email: 'thierry.malo@gmail.com',
    },
  }
})

jest.mock('../ZakProvider', () => {
  //Simule l'exportation par défaut et l'exportation nommée 'foo'
  return {
    __esModule: true,
    useZakari: () => mockUseZakari(),
  }
})

afterEach(cleanup)

describe('TopNavbar (looged in)', () => {
  test('has logout link', () => {
    const { queryByText } = render(
      <BrowserRouter>
        <TopNavbar />
      </BrowserRouter>
    )

    expect(queryByText('Se déconnecter')).toBeTruthy()
    expect(queryByText("S'inscrire")).not.toBeTruthy()
  })

  test('handle logged user', () => {
    const { queryByText } = render(
      <BrowserRouter>
        <TopNavbar />
      </BrowserRouter>
    )

    expect(mockUseZakari).toHaveBeenCalled()
  })
})
