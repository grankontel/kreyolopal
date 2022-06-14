import { render } from '@testing-library/react';
import ReactZakari from './ReactZakari';
describe('ReactZakari', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReactZakari />);
    expect(baseElement).toBeTruthy();
  });
});
