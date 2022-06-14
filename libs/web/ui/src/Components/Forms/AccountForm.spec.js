import { render } from '@testing-library/react';
import AccountForm from './AccountForm';
describe('AccountForm', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AccountForm />);
    expect(baseElement).toBeTruthy();
  });
});
