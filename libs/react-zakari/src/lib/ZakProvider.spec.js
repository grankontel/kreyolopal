import { render } from '@testing-library/react';
import ZakProvider from './ZakProvider';
describe('ZakProvider', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ZakProvider />);
    expect(baseElement).toBeTruthy();
  });
});
