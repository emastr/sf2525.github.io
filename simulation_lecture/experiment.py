import numpy as np
import matplotlib.pyplot as plt


def integrate_sde(x0, a, b, t_grid, W_grid, callback=None):
    x = np.ones((W_grid.shape[0],)) * x0
    for n in range(len(t_grid) - 1):
        t = t_grid[n]
        dt = t_grid[n + 1] - t
        dw = W_grid[:, n + 1] - W_grid[:, n]
        x += a(t, x) * dt + b(t, x) * dw
        if callback is not None:
            callback(n, x)
    return x

def sample_brownian_motions(t_grid, M=1):
    dt_grid = np.diff(t_grid)
    dw_grid = np.random.normal(loc=0.0, scale=np.sqrt(dt_grid), size=(M, len(dt_grid)))
    W_grid = np.concatenate((np.zeros((M, 1)), np.cumsum(dw_grid, axis=1)), axis=1)
    return W_grid

        
def get_t_grid(T, N):
    return np.linspace(0, T, N + 1)

class HistoryCallback:
    def __init__(self, x0, N, M):
        self.x_hist = np.zeros((M, N + 1))
        self.x_hist[:, 0] = x0
    
    def __call__(self, n, x):
        self.x_hist[:, n + 1] = x
        

def get_gbm_paths(s0, r, σ, T, N, M):
    a = lambda t, s: r * s
    b = lambda t, s: σ * s


    t_grid = get_t_grid(T, N)
    s_grid = np.zeros_like(t_grid) + s0
    W_grid = sample_brownian_motions(t_grid, M)
    callback = HistoryCallback(s0, N, M)

    integrate_sde(s0, a, b, t_grid, W_grid, callback)

    s_analytic_grid = s0 * np.exp((r - σ**2 / 2) * t_grid + σ * W_grid)
    s_grid = callback.x_hist
    return t_grid, s_grid, s_analytic_grid


def payoff(s, K):
    return np.maximum(s - K, 0)


r = 1.5
σ = 0.3
s0 = 1.0
T = 1.0
N = 20#10
M = 400#100
K = 0.5


## Method 1: Numerical integration with fixed SDE coef.
t_grid, s_grid, s_analytic_grid = get_gbm_paths(s0, r, σ, T, N, M)

plt.figure()
payoff_ana = payoff(s_analytic_grid, K)
payoff_num = payoff(s_grid, K)

mean_payoff_ana = payoff_ana.mean(axis=0)
mean_payoff_num = payoff_num.mean(axis=0)
err_stat = 2 * payoff_ana.std(axis=0) / np.sqrt(M)
err_num = np.abs(mean_payoff_ana - mean_payoff_num)

plt.plot(T-t_grid, mean_payoff_ana, label="Mean Payoff")
plt.fill_between(T-t_grid, mean_payoff_ana - err_stat, mean_payoff_ana + err_stat, alpha=0.3, label="Statistical Error")
plt.fill_between(T-t_grid, mean_payoff_ana - err_stat, mean_payoff_ana - err_stat - err_num/2, color='red', alpha=0.3, linewidth=0, label="Numerical Error")
plt.fill_between(T-t_grid, mean_payoff_ana + err_stat, mean_payoff_ana + err_stat + err_num/2, color='red', alpha=0.3, linewidth=0)
plt.title(f"Payoff of European Call Option f({s0:.2f}, t), K={K:.2f}, as function of t")
plt.xlabel("Time to Maturity")
plt.ylabel("Payoff")
plt.legend()
plt.show()