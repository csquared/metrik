# metrik

Metrics aggregator for logfmt-style metrics

### `count#`

Sums `count#` style metrics and includes other key=value pairs.

### `measure#`

Emits `mean`, `median`, `perc95`, and `perc99` for `measure#` style metrics.
Includes `n` and `units`.

## Usage

  Try it out:

    > npm install -g metrik
    > cat logs.txt
    2013-10-25T20:19:41.739142+00:00 app[web.3]: count#vault_usage.http_201=1
    2013-10-25T20:19:41.739403+00:00 app[web.3]: count#vault_usage.http_2xx=1
    2013-10-25T20:19:41.739616+00:00 app[web.3]: measure#products_usage_events_close=0.070309922ms
    2013-10-25T20:19:41.799430+00:00 app[web.14]: count#vault_usage.http_201=1
    2013-10-25T20:19:41.799430+00:00 app[web.14]: count#vault_usage.http_2xx=1
    2013-10-25T20:19:41.799577+00:00 app[web.14]: measure#products_usage_events_open=0.010993464ms
    2013-10-25T20:19:41.826215+00:00 app[web.40]: count#vault_usage.http_201=1

    > cat logs.txt | metrik

    count#vault_usage.http_201=3
    count#vault_usage.http_2xx=2
    metrik=products_usage_events_close n=1 units=ms mean=0.070309922 median=0.070309922 perc95=0.070309922 perc99=0.070309922
    metrik=products_usage_events_open n=1 units=ms mean=0.010993464 median=0.010993464 perc95=0.010993464 perc99=0.010993464

  Use it on your dyno:

    web: bundle exec ruby app.rb | metrik
    worker: bin/worker | metrik
