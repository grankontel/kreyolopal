import React from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { useZakari } from '../ZakProvider'
import TopNavbar from '../TopNavbar'

const mockUseZakari = jest.fn(() => {
  return {
    user: null,
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

describe('TopNavbar', () => {
  test('has register link', () => {
    const { queryByText } = render(
      <BrowserRouter>
        <TopNavbar />
      </BrowserRouter>
    )

    expect(queryByText("S'inscrire")).toBeTruthy()
    expect(queryByText('Se déconnecter')).not.toBeTruthy()
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
