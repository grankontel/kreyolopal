import { render } from '@testing-library/react';
import ZakariForm from './ZakariForm';
describe('ZakariForm', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ZakariForm />);
    expect(baseElement).toBeTruthy();
  });
});
