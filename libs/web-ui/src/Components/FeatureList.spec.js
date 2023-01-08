import { render } from '@testing-library/react';
import FeatureList from './FeatureList';
describe('FeatureList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FeatureList />);
    expect(baseElement).toBeTruthy();
  });
});
